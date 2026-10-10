# UBS 성경 경로 자료 적용 점검

원자료: [United Bible Societies Project MARBLE Bible Routes](https://translation.bible/tools-resources/bible-routes-from-ubs-project-marble/) · Dr. Leen Ritmeyer · CC BY-SA 4.0 · [저장소](https://github.com/ubsicap/ubs-open-license/tree/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes) · 커밋 33dcc8c671511151551804e073f1d461bc5d5b1a.

원자료 GeoJSON 179개 중 제목과 인물 식별이 비교적 분명한 100개 경로 도형을 37개 인명 기록에 연결했습니다. 한 경로가 여러 인물에게 연결될 수 있습니다. 전체 3,067개 인명 기록 가운데 나머지 3,030개에는 이 자료로 연결할 수 있는 경로 도형이 없습니다. 앱은 좌표를 소수 여섯 자리로 반올림하고 인물 ID·한국어 제목을 붙였습니다. 이 파생 경로 파일은 CC BY-SA 4.0으로 제공합니다.

**중요한 제한:** UBS GeoJSON에는 경로별 인물 ID, 장절, 각 선분의 이동 근거가 들어 있지 않습니다. 아래의 인물 연결은 원본 제목과 이야기 문맥을 바탕으로 한 편집 분류이며, 모든 경로를 성경 본문으로 구간별 검수한 결과가 아닙니다. 지도 선은 UBS의 재구성 도형으로 고대의 실제 길 또는 이동 시간이라는 뜻이 아닙니다. 출애굽 경로안들은 서로 다른 제안을 병렬로 보여줍니다. 이동 기록이 없거나 원자료에서 명확한 경로가 없는 인물에게 선을 만들지 않았습니다. 원자료의 전쟁·영토·성전 도형 등은 인물 개인의 이동으로 무리하게 연결하지 않았습니다. 기존 앱의 본문 검수 여정 7개와 이 경로 도형을 구별해 표시합니다.

## 지도에 함께 표시하는 도시 후보

UBS 선에는 도시 이름이나 순서가 없으므로, 앱은 별도 자료에서 도시 후보를 계산합니다. Theographic 인물 색인의 **인물과 지명이 같은 절에 나온 기록** 중 경로 제목에 해당하는 성경 책의 절을 고르고, OpenBible 지명 자료의 `settlement` 좌표가 UBS 선에서 8km 이내인 경우에만 표시합니다. 다윗의 도피 4개 도형은 사무엘상 19–30장으로 좁혔습니다. 동일 좌표에 붙은 여러 옛 이름은 1km 안에서 하나만 보여 줍니다. 핀 번호는 선에 가까운 순서이며 이동 순서가 아닙니다. 표시한 구절도 방문을 확증하지 않습니다.

현재 100개 도형과 37개 인명의 연결 114건 중 92건에서 이 기준에 맞는 도시가 한 곳 이상 나오고, 22건은 도시 후보를 표시하지 않습니다. 해당 선의 경유 도시를 모두 확인했다는 뜻이 아닙니다. 나머지 경로는 UBS 원자료에 경유지 표와 장절이 제공되거나 개별 본문 검수를 마쳐야 확정 목록을 만들 수 있습니다.

| 자료 번호 | 앱의 제목 | 연결한 인명 ID | UBS 원본 |
| --- | --- | --- | --- |
| 001 | 아브람, 하란으로 | abraham_58 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/001.%20Abram's%20Journey%20to%20Haran.geojson) |
| 002 | 아브람, 다메섹으로 | abraham_58 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/002.%20Abram's%20Journey%20to%20Damascus.geojson) |
| 003 | 아브람, 세겜으로 | abraham_58 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/003.%20Abram's%20Journey%20to%20Shechem.geojson) |
| 004 | 네겝에서 애굽으로 | abraham_58 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/004.%20Abram's%20Journey%20from%20the%20Negev%20to%20Egypt.geojson) |
| 005 | 아브람의 애굽 여정 | abraham_58 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/005.%20Abram's%20Journey%20to%20Egypt.geojson) |
| 012 | 아브람, 살렘으로 | abraham_58 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/012.%20Abram's%20Journey%20to%20Salem.geojson) |
| 013 | 멜기세덱을 만난 아브람 | abraham_58 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/013.%20Abram%20meets%20Melchizedek.geojson) |
| 015 | 하갈의 길 | hagar_1348 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/015.%20GEN%2016%20Hagar.geojson) |
| 017 | 롯, 소알로 | lot_1830 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/017.%20GEN%2019%20Lot%20to%20Zoar.geojson) |
| 018 | 헤브론에서 그랄로 | abraham_58 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/018.%20GEN%2020%20Hebron%20to%20Gerar.geojson) |
| 019 | 그랄에서 모리아로 | abraham_58, isaac_616 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/019.%20GEN%2022%20Gerar%20to%20Moriah.geojson) |
| 020 | 모리아 땅으로 | abraham_58, isaac_616 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/020.%20GEN%2022%20Land%20of%20Moriah.geojson) |
| 021 | 모리아에서 브엘세바로 | abraham_58, isaac_616 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/021.%20GEN%2022%20Moriah%20to%20Beersheba.geojson) |
| 023 | 브엘세바에서 하란으로 | israel_682 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/023.%20Beersheba%20to%20Haran.geojson) |
| 025 | 이삭, 그랄로 | isaac_616 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/025.%20Isaac%20to%20Gerar.geojson) |
| 026 | 이삭, 브엘세바로 | isaac_616 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/026.%20Isaac%20to%20Beersheba.geojson) |
| 027 | 야곱, 벧엘로 | israel_682 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/027.%20Jacob%20to%20Bethel.geojson) |
| 028 | 하란에서 길르앗으로 | israel_682 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/028.%20Haran%20to%20Gilead.geojson) |
| 029 | 미스바에서 벧엘로 | israel_682 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/029.%20Mizpah%20to%20Bethel.geojson) |
| 031 | 요셉, 도단으로 | joseph_1710 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/031.%20Joseph%20to%20Dothan.geojson) |
| 033 | 유다, 딤나로 | judah_1751 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/033.%20Judah%20to%20Timnah.geojson) |
| 035 | 야곱, 고센으로 | israel_682 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/035.%20Jacob%20to%20Goshen.geojson) |
| 036 | 야곱, 바로를 만나러 | israel_682 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/036.%20Jacob%20to%20Pharaoh.geojson) |
| 039 | 모세, 미디안으로 | moses_2108 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/039.%20Moses%20to%20Midian.geojson) |
| 040 | 모세, 호렙으로 | moses_2108 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/040.%20Moses%20to%20Horeb.geojson) |
| 041 | 아론, 호렙으로 | aaron_1 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/041.%20Aaron%20to%20Horeb.geojson) |
| 042 | 출애굽 경로안 1 | moses_2108, aaron_1 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/042.%20Exodus%20Route1.geojson) |
| 043 | 출애굽 경로안 2 | moses_2108, aaron_1 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/043.%20Exodus%20Route2.geojson) |
| 046 | 광야 방랑 경로안 | moses_2108, aaron_1 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/046.%2038%20years%20wandering.geojson) |
| 047 | 요단 동편의 여정 | moses_2108 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/047.%20Transjordan.geojson) |
| 049 | 발람의 여정 | balaam_593 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/049.%20Balaam's%20Journey.geojson) |
| 054 | 요단강 건너기 | joshua_1727 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/054.%20Crossing%20the%20Jordan.geojson) |
| 055 | 여리고 진입 | joshua_1727 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/055.%20Capture%20of%20Jericho.geojson) |
| 056 | 아이로 | joshua_1727 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/056.%20Conquest%20of%20Ai.geojson) |
| 067 | 에훗의 길 | ehud_1039 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/067.%20Ehud's%20battle.geojson) |
| 068 | 드보라의 길 | deborah_997 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/068.%20Deborah.geojson) |
| 069 | 기드온의 길 | gideon_1314 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/069.%20Gideon.geojson) |
| 070 | 아비멜렉의 길 | abimelech_41 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/070.%20Abimelech.geojson) |
| 071 | 입다의 길 | jephthah_839 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/071.%20Jephthah.geojson) |
| 072 | 삼손의 길 | samson_2468 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/072.%20Samson.geojson) |
| 075 | 룻과 나오미의 길 | ruth_2450, naomi_2147 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/075.%20Ruth.geojson) |
| 076 | 한나의 길 | hannah_1400 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/076.%20Hannah.geojson) |
| 080 | 사무엘의 순회 | samuel_2469 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/080.%20Samuel's%20Circuit.geojson) |
| 081 | 사울이 나귀를 찾아간 길 | saul_2478 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/081.%20Saul's%20donkey.geojson) |
| 086 | 다윗의 도피 1 | david_994 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/086.%20David's%20wanderings_1.geojson) |
| 087 | 다윗의 도피 2 | david_994 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/087.%20David's%20wanderings_2.geojson) |
| 088 | 다윗의 도피 3 | david_994 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/088.%20David's%20wanderings_3.geojson) |
| 089 | 다윗의 도피 4 | david_994 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/089.%20David's%20wandering_4.geojson) |
| 104 | 스바 여왕의 길 | queen_of_sheba_2379 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/104.%20Queen%20of%20Sheba.geojson) |
| 107a | 르호보암, 세겜으로 1 | rehoboam_2412 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/107a.%20Rehoboam%20to%20Shechem.geojson) |
| 107b | 르호보암, 세겜으로 2 | rehoboam_2412 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/107b.%20Rehoboam%20to%20Shechem.geojson) |
| 114 | 엘리야의 사역 | elijah_1131 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/114.%20Ministry%20of%20Elijah.geojson) |
| 115 | 갈멜산의 엘리야 | elijah_1131 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/115.%20Elijah%20on%20Mount%20Carmel.geojson) |
| 116 | 엘리야, 시내산으로 | elijah_1131 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/116.%20Elijah%20to%20Sinai.geojson) |
| 117 | 엘리야와 엘리사 | elijah_1131, elisha_1153 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/117.%20Elijah%20and%20Elisha.geojson) |
| 121 | 엘리야의 사역 이어서 | elijah_1131 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/121.%20Ministry%20of%20Elijah%20(contd.).geojson) |
| 122 | 엘리사의 사역 | elisha_1153 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/122.%20Ministry%20of%20Elisha.geojson) |
| 126 | 엘리사의 사역 이어서 1 | elisha_1153 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/126.%20Ministry%20of%20Elisha_cont.geojson) |
| 127 | 나아만의 길 | naaman_2122 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/127.%20Naaman.geojson) |
| 128 | 엘리사의 사역 이어서 2 | elisha_1153 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/128.%20Ministry%20of%20Elisha_cont.geojson) |
| 130 | 엘리사와 하사엘 | elisha_1153 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/130.%20Elisha%20and%20Hazael.geojson) |
| 132 | 예후의 길 | jehu_817 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/132.%20Jehu.geojson) |
| 152 | 마리아, 엘리사벳을 방문 | mary_1938 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/152.%20Nazareth%20to%20Hebron.geojson) |
| 153 | 나사렛에서 베들레헴으로 | mary_1938, joseph_1715, jesus_905 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/153.%20Nazareth%20to%20Bethlehem.geojson) |
| 155 | 요나의 길 | jonah_1689 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/155.%20Jonah.geojson) |
| 155a | 베들레헴에서 애굽으로 | mary_1938, joseph_1715, jesus_905 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/155a.%20Bethlehem%20to%20Egypt.geojson) |
| 155b | 베들레헴·애굽·나사렛 | mary_1938, joseph_1715, jesus_905 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/155b.%20Bethlehem-Egypt-Nazareth.geojson) |
| 158 | 세례 요한의 활동 지역 | john_1676 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/158.%20Bethabara%20and%20Aenon.geojson) |
| 161 | 가나의 첫 표적 | jesus_905 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/161.%20First%20miracle%20in%20Cana.geojson) |
| 162 | 예수님, 사마리아로 | jesus_905 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/162.%20Jesus%20to%20Samaria.geojson) |
| 163 | 사마리아에서 나사렛으로 | jesus_905 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/163.%20Samaria%20to%20Nazareth.geojson) |
| 164 | 가나의 두 번째 표적 | jesus_905 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/164.%20Second%20miracle%20in%20Cana.geojson) |
| 165 | 나사렛에서 가버나움으로 | jesus_905 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/165.%20Nazareth%20to%20Capernaum.geojson) |
| 166 | 어부 제자들을 부르심 | jesus_905 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/166.%20Fishermen%20disciples.geojson) |
| 168 | 갈릴리 회당에서 전파 | jesus_905 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/168.%20Preaching%20in%20the%20synagogues%20of%20Galilee.geojson) |
| 169 | 가버나움에서 예루살렘으로 | jesus_905 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/169.%20Capernaum%20to%20Jerusalem.geojson) |
| 170 | 나인으로 | jesus_905 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/170.%20Nain.geojson) |
| 170a | 두로와 시돈 지역 | jesus_905 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/170a.%20Tyre_Sidon.geojson) |
| 170b | 풍랑을 만난 길 | jesus_905 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/170b.%20Storm.geojson) |
| 172 | 변화산 장면 | jesus_905 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/172.%20Transfiguration.geojson) |
| 174 | 가버나움에서 예루살렘으로 | jesus_905 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/174.%20Capernaum%20to%20Jerusalem.geojson) |
| 176 | 수전절 무렵 | jesus_905 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/176.%20Dedication.geojson) |
| 177 | 나사로를 살리심 | jesus_905 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/177.%20Raising%20Lazarus.geojson) |
| 178 | 에브라임으로 | jesus_905 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/178.%20Ephraim.geojson) |
| 179 | 예루살렘을 향한 마지막 길 | jesus_905 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/179.%20Last%20Journey%20to%20Jerusalem.geojson) |
| 192 | 엠마오로 가는 길 | jesus_905 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/192.%20Road%20to%20Emmaus.geojson) |
| 193 | 베다니에서 승천 | jesus_905 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/193.%20Ascension%20in%20Bethany.geojson) |
| 197 | 빌립, 사마리아에서 | philip_2347 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/197.%20Philip%20in%20Samaria.geojson) |
| 198 | 빌립과 에티오피아 내시 | philip_2347 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/198.%20Philip%20and%20the%20Ethiopian%20Eunuch.geojson) |
| 199 | 사울, 다메섹으로 | paul_2479 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/199.%20Saul%20on%20the%20Road%20to%20Damascus.geojson) |
| 199a | 바울, 아라비아와 다메섹으로 | paul_2479 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/199a.%20Paul%20to%20Arabia%20and%20back%20to%20Damascus..geojson) |
| 199b-1 | 바울, 예루살렘과 가이사랴로 | paul_2479 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/199b.%20Paul%20to%20Jerusalem%20and%20Caesarea.geojson) |
| 199b-2 | 바울, 다소로 | paul_2479 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/199b.%20Paul%20to%20Tarsus.geojson) |
| 200 | 다소에서 안디옥으로 | paul_2479 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/200.%20Paul%E2%80%99s%20journey%20from%20Tarsus%20to%20Antioch.geojson) |
| 201 | 베드로의 해안 평야 사역 | peter_2745 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/201.%20Peter%20in%20the%20Coastal%20Plain.geojson) |
| 202 | 바울의 1차 선교 여정 | paul_2479 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/202.%20First%20Missionary%20Journey.geojson) |
| 202a | 안디옥에서 예루살렘으로 | paul_2479 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/202a.%20Journey%20from%20Antioch%20to%20Jerusalem.geojson) |
| 203 | 바울의 2차 선교 여정 | paul_2479 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/203.%20Second%20Missionary%20Journey.geojson) |
| 204 | 바울의 3차 선교 여정 | paul_2479 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/204.%20Third%20Missionary%20Journey.geojson) |
| 205 | 바울의 로마 이송 | paul_2479 | [원본](https://github.com/ubsicap/ubs-open-license/blob/33dcc8c671511151551804e073f1d461bc5d5b1a/ubs-bible-routes/GeoJsonRoutes/205.%20Paul's%20Voyage%20to%20Rome.geojson) |
