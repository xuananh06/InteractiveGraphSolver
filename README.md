# Graph Solver — Interactive Graph Algorithm Visualizer

**Link Demo:** https://xuananh06.github.io/InteractiveGraphSolver/

Ứng dụng web chạy trực tiếp trên trình duyệt để **vẽ đồ thị trên Canvas** và **trực quan hóa** các thuật toán cơ bản (tô màu đường đi/cạnh, đánh số thứ tự bước duyệt, hỗ trợ chạy từng bước).

## Tính năng chính
- **Vẽ đồ thị tương tác**:
  - Thêm/xóa **đỉnh**
  - Thêm/xóa **cạnh** (hỗ trợ **trọng số** và **cạnh có hướng**)
  - Kéo-thả để di chuyển đỉnh
- **Trực quan hóa kết quả trên Canvas**:
  - **Đổi màu** các cạnh thuộc **Shortest Path** / **MST**
  - **Đánh số thứ tự** đỉnh/cạnh theo thứ tự duyệt / thứ tự cạnh trong đường đi/chu trình
  - **Animate (step-by-step)**: chạy highlight từng bước + log step trong panel kết quả
- **Bảng “Analysis & Results”**:
  - Hiển thị kết quả thuật toán và log theo bước (khi bật animate)
  - Nút **Clear Results** để xóa kết quả

## Thuật toán hỗ trợ
- **DFS** (Depth First Search)
- **BFS** (Breadth First Search)
- **Dijkstra** (Shortest Path)
- **MST (Prim)** (Minimum Spanning Tree — yêu cầu đồ thị vô hướng)
- **Euler Path / Circuit**:
  - Kiểm tra điều kiện bậc + liên thông
  - Dựng đường đi/chu trình bằng **Hierholzer** (đồ thị **vô hướng**)
- **Euler (có hướng)**:
  - Hỗ trợ nếu đồ thị **chỉ gồm cạnh có hướng** (không mix vô hướng và có hướng)
  - Điều kiện theo **in-degree/out-degree** và kiểm tra tính liên thông theo chiều
- **Hamilton Path / Circuit**:
  - Tìm kiếm thực tế bằng **backtracking** (NP-Complete)

## Cách chạy
Vì đây là project tĩnh (HTML/CSS/JS), bạn chỉ cần:
- Mở `index.html` bằng trình duyệt (Chrome/Edge/Firefox).

## Cách sử dụng nhanh
- **Vertex**: chọn tool Vertex và click lên canvas để thêm đỉnh.
- **Edge**: chọn tool Edge, click 2 đỉnh liên tiếp để tạo cạnh → nhập **weight** và chọn **directed** nếu cần.
- **Select**: chọn tool Select để kéo-thả đỉnh, hoặc chọn 1 đỉnh làm “start” (một số thuật toán dùng đỉnh đang chọn).
- **Run Algorithm**:
  - Chọn thuật toán ở dropdown, nhấn **Run Algorithm**
  - Tick **Animate (step-by-step)** để xem chạy từng bước + log Step 1/2/3…
- **Clear Results**: xóa panel kết quả.
- **Clear Graph**: xóa toàn bộ đồ thị.

## Ghi chú & giới hạn
- **Dijkstra** yêu cầu **trọng số không âm** (nếu có trọng số âm, kết quả không đảm bảo đúng).
- **Hamilton** có thể chậm với đồ thị lớn vì dùng backtracking.