| Name            | Status                   | Render duration change                 | Render count change    |
| --------------- | ------------------------ | -------------------------------------- | ---------------------- |
| AsyncComponent5 | **SIGNIFICANT**          | **8.2 ms -> 12.2 ms, +4.0 ms, +48.8%** | 6 -> 8, +2, +33.3%     |
|                 |                          |                                        |                        |
| AsyncComponent2 | MEANINGLESS              | **8.2 ms -> 9.2 ms, +1.0 ms, +12.2%**  | 6 -> 6, 0, ±0.0%       |
| AsyncComponent4 | MEANINGLESS              | **8.2 ms -> 8.9 ms, +0.7 ms, +8.5%**   | 6 -> 7, +1, +16.7%     |
| AsyncComponent3 | MEANINGLESS              | **8.2 ms -> 8.5 ms, +0.3 ms, +3.7%**   | 6 -> 6, 0, ±0.0%       |
| AsyncComponent  | MEANINGLESS              | **8.2 ms -> 8.2 ms, 0 ms, ±0.0%**      | 6 -> 6, 0, ±0.0%       |
|                 |                          |                                        |                        |
| AsyncComponent5 | **RENDER_COUNT_CHANGED** | 8.2 ms -> 12.2 ms, +4.0 ms, +48.8%     | **6 -> 8, +2, +33.3%** |
| AsyncComponent4 | **RENDER_COUNT_CHANGED** | 8.2 ms -> 8.9 ms, +0.7 ms, +8.5%       | **6 -> 7, +1, +16.7%** |
|                 |                          |                                        |                        |