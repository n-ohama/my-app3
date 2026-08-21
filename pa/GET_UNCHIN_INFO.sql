PROCEDURE GET_UNCHIN_INFO (P_KENCD IN NUMBER) IS
  TYPE REC_HINCD IS RECORD (
    HINCD  VARCHAR2(11),
    SUU    NUMBER(4),
    KOGUTI NUMBER
  );
  TYPE T_SKU_LIST IS TABLE OF REC_HINCD INDEX BY PLS_INTEGER;
  TYPE REC_SIZE_PENDING IS RECORD (
    KONKB    NUMBER(1),
    HAISOBKB NUMBER(1),
    KPSIZE   NUMBER,
    SKU_LIST T_SKU_LIST
  );
  TYPE T_SIZE_PENDING IS TABLE OF REC_SIZE_PENDING INDEX BY PLS_INTEGER;
  TBL_SIZE_PENDING T_SIZE_PENDING;

  TYPE REC_SIZE_KNOWN IS RECORD (
    HAKO_SIZE NUMBER,
    HAISOBKB  NUMBER(1)
  );
  TYPE T_SIZE_KNOWN IS TABLE OF REC_SIZE_KNOWN INDEX BY PLS_INTEGER;
  TBL_SIZE_KNOWN T_SIZE_KNOWN;

  TYPE REC_UNCHIN IS RECORD (
    SOKOCD NUMBER,
    RANK   NUMBER,
    AMOUNT NUMBER
  );
  TYPE T_UNCHIN IS TABLE OF REC_UNCHIN INDEX BY PLS_INTEGER;
  TBL_UNCHIN T_UNCHIN;

  v_idx          PLS_INTEGER;
  v_size         NUMBER;
  v_koguti_total NUMBER;
  v_hakokey      VARCHAR2(4000);
  v_hakosize     NUMBER;
  v_unchin_tmp   REC_UNCHIN;

  e_unchin_not_found EXCEPTION;

  PROCEDURE ADD_TBL_SIZE_PENDING (P_SKU_REC IN SKUMS%ROWTYPE) IS
    v_sku_idx PLS_INTEGER;
    v_found   BOOLEAN;
  BEGIN
    -- 個口が１の場合
    IF P_SKU_REC.SKUMS_KOGUTI = 1 THEN
      v_idx := TBL_SIZE_PENDING.COUNT + 1;
      TBL_SIZE_PENDING(v_idx).HAISOBKB := P_SKU_REC.SKUMS_HAISOBKB;
    ELSE
      v_found := FALSE;
      FOR j IN 1..TBL_SIZE_PENDING.COUNT LOOP
        IF TBL_SIZE_PENDING(j).KONKB    = P_SKU_REC.SKUMS_KONKB AND
           TBL_SIZE_PENDING(j).HAISOBKB = P_SKU_REC.SKUMS_HAISOBKB AND
          (TBL_SIZE_PENDING(j).KONKB <> 3 OR TBL_SIZE_PENDING(j).KPSIZE = P_SKU_REC.SKUMS_KPSIZE) THEN
          v_idx   := j;
          v_found := TRUE;
          EXIT; -- 該当グループが見つかったら抜け出す
        END IF;
      END LOOP;

      -- 該当グループが存在しない場合は新しく要素を追加
      IF NOT v_found THEN
        v_idx := TBL_SIZE_PENDING.COUNT + 1;
        TBL_SIZE_PENDING(v_idx).KONKB    := P_SKU_REC.SKUMS_KONKB;
        TBL_SIZE_PENDING(v_idx).HAISOBKB := P_SKU_REC.SKUMS_HAISOBKB;
        TBL_SIZE_PENDING(v_idx).KPSIZE   := P_SKU_REC.SKUMS_KPSIZE;
      END IF;
    END IF;

    v_sku_idx := TBL_SIZE_PENDING(v_idx).SKU_LIST.COUNT + 1;
    TBL_SIZE_PENDING(v_idx).SKU_LIST(v_sku_idx).HINCD  := P_SKU_REC.SKUMS_HINCD;  -- 商品コード
    TBL_SIZE_PENDING(v_idx).SKU_LIST(v_sku_idx).SUU    := P_SKU_REC.SKUMS_SUU;    -- 数量
    TBL_SIZE_PENDING(v_idx).SKU_LIST(v_sku_idx).KOGUTI := P_SKU_REC.SKUMS_KOGUTI; -- 個口
  END ADD_TBL_SIZE_PENDING;

  -- グループ内SKUを商品コード昇順に「商品コード＋数量」で連結し、HAKOSMS検索用のHAKOKEYを組み立てる
  FUNCTION BUILD_HAKOKEY (P_SKU_LIST IN T_SKU_LIST) RETURN VARCHAR2 IS
    v_sku_list T_SKU_LIST := P_SKU_LIST; -- IN引数は直接ソートできないためローカルにコピー
    v_cnt      PLS_INTEGER := P_SKU_LIST.COUNT;
    v_tmp      REC_HINCD;
    v_key      VARCHAR2(4000) := NULL;
  BEGIN
    -- 商品コード昇順に並べ替え（件数が少ないため単純選択ソート）
    FOR a IN 1..v_cnt-1 LOOP
      FOR b IN a+1..v_cnt LOOP
        IF v_sku_list(b).HINCD < v_sku_list(a).HINCD THEN
          v_tmp         := v_sku_list(a);
          v_sku_list(a) := v_sku_list(b);
          v_sku_list(b) := v_tmp;
        END IF;
      END LOOP;
    END LOOP;

    FOR a IN 1..v_cnt LOOP
      v_key := v_key || v_sku_list(a).HINCD || v_sku_list(a).SUU;
    END LOOP;

    RETURN v_key;
  END BUILD_HAKOKEY;

  -- 配送便区分・倉庫コード・サイズから運賃マスタUNCMSを引く。P_SIZE以上の最小サイズ区分の運賃を1件取得する。
  -- P_KENCDはGET_UNCHIN_INFOの仮引数をそのまま参照する。
  FUNCTION GET_UNCHIN_PRICE (
    P_HAISOBKB IN NUMBER,
    P_SOKOCD   IN NUMBER,
    P_SIZE     IN NUMBER
  ) RETURN NUMBER IS
    v_price NUMBER;
  BEGIN
    SELECT UNCMS_AMOUNT
      INTO v_price
      FROM (
        SELECT UNCMS_AMOUNT
          FROM UNCMS
         WHERE UNCMS_KENCD    = P_KENCD
           AND UNCMS_HAISOBKB = P_HAISOBKB
           AND UNCMS_SOKOCD   = P_SOKOCD
           AND UNCMS_KPSIZE  >= P_SIZE
         ORDER BY UNCMS_KPSIZE ASC
      )
     WHERE ROWNUM = 1;

    RETURN v_price;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE e_unchin_not_found;
  END GET_UNCHIN_PRICE;

BEGIN
  -- 明細単品商品コードから個口が１もしくは１未満かをチェックする。箱サイズがわかる商品とわからない商品で分類する。
  FOR i IN 1..TBL_SKUMS.COUNT LOOP
    IF TBL_SKUMS(i).SKUMS_KOGUTI < 1 THEN
      ADD_TBL_SIZE_PENDING( TBL_SKUMS(i) );
    ELSIF TBL_SKUMS(i).SKUMS_KOGUTI = 1 THEN
      IF TBL_SKUMS(i).SKUMS_JIKAFLG = 1 THEN
        v_idx  := TBL_SIZE_KNOWN.COUNT + 1;
        v_size := (TBL_SKUMS(i).SKUMS_KPSIZEH + TBL_SKUMS(i).SKUMS_KPSIZET + TBL_SKUMS(i).SKUMS_KPSIZEY) / 10;
        TBL_SIZE_KNOWN(v_idx).HAKO_SIZE := v_size;
        TBL_SIZE_KNOWN(v_idx).HAISOBKB  := TBL_SKUMS(i).SKUMS_HAISOBKB;
      ELSE
        ADD_TBL_SIZE_PENDING( TBL_SKUMS(i) );
      END IF;
    ELSE
      RETURN;
    END IF;
  END LOOP;

  -- TBL_SIZE_PENDINGの各分類グループについて、個口係数×数量の合計が1を超えていないか確認する。
  -- 1を超えるグループが1つでもあれば、箱詰めシミュレーションの対象外としてこのプロシージャを終了する。
  FOR g IN 1..TBL_SIZE_PENDING.COUNT LOOP
    v_koguti_total := 0;
    FOR s IN 1..TBL_SIZE_PENDING(g).SKU_LIST.COUNT LOOP
      v_koguti_total := v_koguti_total
        + TBL_SIZE_PENDING(g).SKU_LIST(s).KOGUTI * TBL_SIZE_PENDING(g).SKU_LIST(s).SUU;
    END LOOP;

    IF v_koguti_total > 1 THEN
      RETURN;
    END IF;
  END LOOP;

  FOR i IN 1..WK_YSOKO.COUNT LOOP
    TBL_UNCHIN(i).SOKOCD := WK_YSOKO(i).SOKOCD;
    TBL_UNCHIN(i).RANK   := i;
    TBL_UNCHIN(i).AMOUNT := 0;
  END LOOP;

  FOR i IN 1..TBL_UNCHIN.COUNT LOOP
    -- TBL_SIZE_PENDINGの各グループについて、この倉庫候補での箱サイズをHAKOSMSから求め、運賃を加算する
    FOR g IN 1..TBL_SIZE_PENDING.COUNT LOOP
      v_hakokey := BUILD_HAKOKEY(TBL_SIZE_PENDING(g).SKU_LIST);

      -- SOKOCD＋HAKOKEYで複数件ヒットする場合があるが箱サイズはどれも同じなのでROWNUM=1で1件に絞る
      BEGIN
        SELECT (HAKO_KPSIZEH + HAKO_KPSIZET + HAKO_KPSIZEY) / 10
          INTO v_hakosize
          FROM HAKOSMS
         WHERE SOKOCD  = TBL_UNCHIN(i).SOKOCD
           AND HAKOKEY = v_hakokey
           AND ROWNUM  = 1;
      EXCEPTION
        WHEN NO_DATA_FOUND THEN
          -- 箱サイズが1件も取得できない場合は運賃計算を行わず終了する
          RETURN;
      END;

      TBL_UNCHIN(i).AMOUNT := TBL_UNCHIN(i).AMOUNT
        + GET_UNCHIN_PRICE(TBL_SIZE_PENDING(g).HAISOBKB, TBL_UNCHIN(i).SOKOCD, v_hakosize);
    END LOOP;
    -- TBL_SIZE_KNOWN（箱サイズ既知）の各グループの運賃を加算する
    FOR g IN 1..TBL_SIZE_KNOWN.COUNT LOOP
      TBL_UNCHIN(i).AMOUNT := TBL_UNCHIN(i).AMOUNT
        + GET_UNCHIN_PRICE(TBL_SIZE_KNOWN(g).HAISOBKB, TBL_UNCHIN(i).SOKOCD, TBL_SIZE_KNOWN(g).HAKO_SIZE);
    END LOOP;
  END LOOP;

  -- 合計運賃が安い順にTBL_UNCHINを並べ替える（候補は4件のみのため単純選択ソートで十分）。
  -- 運賃が同額の場合はRANK（元のYUSEM優先順位）が小さい方を優先する。
  FOR a IN 1..TBL_UNCHIN.COUNT - 1 LOOP
    FOR b IN a+1..TBL_UNCHIN.COUNT LOOP
      IF TBL_UNCHIN(b).AMOUNT < TBL_UNCHIN(a).AMOUNT
         OR (TBL_UNCHIN(b).AMOUNT = TBL_UNCHIN(a).AMOUNT AND TBL_UNCHIN(b).RANK < TBL_UNCHIN(a).RANK) THEN
        v_unchin_tmp  := TBL_UNCHIN(a);
        TBL_UNCHIN(a) := TBL_UNCHIN(b);
        TBL_UNCHIN(b) := v_unchin_tmp;
      END IF;
    END LOOP;
  END LOOP;

  -- 並べ替え結果をWK_YSOKOへ反映する
  FOR i IN 1..TBL_UNCHIN.COUNT LOOP
    WK_YSOKO(i).SOKOCD := TBL_UNCHIN(i).SOKOCD;
  END LOOP;

EXCEPTION
  WHEN e_unchin_not_found THEN
    RETURN; -- 該当運賃が1件も見つからない場合は何もせず終了
END GET_UNCHIN_INFO;
