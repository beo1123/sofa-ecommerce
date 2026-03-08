# Bộ Câu Hỏi Phỏng Vấn — Software Developer (MES/ERP)

> Dựa trên JD: phát triển phần mềm nội bộ MES/ERP, tech stack C#/Java/JS, làm việc với database & API, unit testing, Git.

---

## 1. Kiến Thức Nền Tảng Lập Trình

### Câu hỏi lý thuyết

1. **OOP là gì? Hãy giải thích 4 tính chất cơ bản của OOP và cho ví dụ thực tế.**
   > Encapsulation, Inheritance, Polymorphism, Abstraction.

2. **Sự khác nhau giữa `interface` và `abstract class` là gì? Khi nào nên dùng cái nào?**

3. **Dependency Injection (DI) là gì? Tại sao nó quan trọng trong phát triển phần mềm?**

4. **Design pattern là gì? Hãy mô tả 2–3 pattern bạn đã dùng trong dự án (ví dụ: Singleton, Repository, Factory).**

5. **SOLID là gì? Hãy giải thích từng chữ cái và cho ví dụ vi phạm / tuân thủ nguyên tắc đó.**

6. **Stack và Heap khác nhau như thế nào? Khi nào dữ liệu được lưu trên stack / heap?**

7. **Sự khác nhau giữa lập trình đồng bộ (synchronous) và bất đồng bộ (asynchronous) là gì?**

---

## 2. C# / .NET

1. **Sự khác nhau giữa `value type` và `reference type` trong C#?**

2. **`async/await` hoạt động như thế nào trong C#? Khi nào nên dùng?**

3. **LINQ là gì? Hãy viết một câu LINQ để lọc danh sách sản phẩm có giá > 1.000.000.**
   ```csharp
   var result = products.Where(p => p.Price > 1_000_000).ToList();
   ```

4. **`IEnumerable` khác `IQueryable` như thế nào?**

5. **Garbage Collector trong .NET hoạt động ra sao? Khi nào bạn cần implement `IDisposable`?**

6. **Dependency Injection trong ASP.NET Core được cấu hình như thế nào (Singleton / Scoped / Transient)?**

7. **Entity Framework Core là gì? Sự khác nhau giữa Code-First và Database-First?**

8. **Middleware trong ASP.NET Core là gì? Cho ví dụ một middleware bạn đã tự viết hoặc sử dụng.**

---

## 3. Java (nếu áp dụng)

1. **JVM là gì? Giải thích vòng đời của một chương trình Java từ lúc viết code đến lúc chạy.**

2. **`Checked Exception` khác `Unchecked Exception` như thế nào? Khi nào nên throw/catch từng loại?**

3. **Spring Boot là gì? Tại sao nó phổ biến trong phát triển enterprise?**

4. **`@Autowired`, `@Component`, `@Service`, `@Repository` dùng để làm gì?**

5. **Sự khác nhau giữa `HashMap` và `ConcurrentHashMap`?**

6. **Stream API trong Java 8 là gì? Viết ví dụ lọc danh sách.**
   ```java
   List<Product> result = products.stream()
       .filter(p -> p.getPrice() > 1_000_000)
       .collect(Collectors.toList());
   ```

---

## 4. Frontend — HTML / CSS / JavaScript

1. **Sự khác nhau giữa `let`, `const`, và `var` trong JavaScript?**

2. **`Promise` và `async/await` khác nhau như thế nào? Khi nào nên dùng `Promise.all()`?**

3. **Event bubbling và event capturing là gì?**

4. **`==` khác `===` như thế nào trong JavaScript?**

5. **`localStorage`, `sessionStorage`, và `cookie` khác nhau như thế nào?**

6. **Flexbox và Grid CSS khác nhau ra sao? Khi nào nên dùng cái nào?**

7. **SPA (Single Page Application) là gì? Ưu / nhược điểm so với MPA?**

8. **Bạn đã làm việc với framework frontend nào? (React/Vue/Angular) — Giải thích lifecycle hoặc component lifecycle.**

9. **DOM là gì? Hãy mô tả cách bạn tối ưu hiệu suất khi thao tác với DOM.**

---

## 5. Database & SQL

1. **Sự khác nhau giữa `INNER JOIN`, `LEFT JOIN`, và `RIGHT JOIN`?**

2. **Primary Key và Foreign Key là gì? Cho ví dụ trong thiết kế bảng.**

3. **Index trong database là gì? Khi nào nên và không nên tạo index?**

4. **Transaction là gì? ACID là gì? Hãy giải thích từng tính chất.**

5. **Stored Procedure và View khác nhau như thế nào?**

6. **Normalization là gì? Hãy giải thích 1NF, 2NF, 3NF.**

7. **Khi query chậm, bạn sẽ debug và tối ưu như thế nào? (EXPLAIN / EXPLAIN ANALYZE)**

8. **ORM (Object-Relational Mapping) là gì? Ưu / nhược điểm so với raw SQL?**

---

## 6. API & RESTful

1. **RESTful API là gì? Các nguyên tắc cơ bản của REST?**

2. **Sự khác nhau giữa HTTP methods: GET, POST, PUT, PATCH, DELETE?**

3. **HTTP status code nào dùng cho từng trường hợp: thành công, lỗi client, lỗi server?**
   > 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error.

4. **Authentication vs Authorization khác nhau như thế nào? JWT hoạt động ra sao?**

5. **CORS là gì? Tại sao nó xảy ra và cách xử lý?**

6. **Bạn sẽ thiết kế API endpoint để lấy danh sách đơn hàng với phân trang như thế nào?**
   > Ví dụ: `GET /api/orders?page=1&pageSize=20`

7. **Swagger / OpenAPI là gì? Bạn đã dùng để document API chưa?**

---

## 7. Unit Testing & Debugging

1. **Unit test là gì? Tại sao cần viết unit test?**

2. **Sự khác nhau giữa Unit Test, Integration Test, và E2E Test?**

3. **AAA pattern trong unit test là gì? (Arrange – Act – Assert)**

4. **Mock object là gì? Khi nào cần mock trong test?**

5. **Bạn đã dùng framework test nào? (xUnit/.NETTest, JUnit, Jest, …)**

6. **Code coverage là gì? Con số 80% coverage có đảm bảo code không có bug không?**

7. **Khi gặp bug trong production, quy trình debug của bạn là gì?**

8. **Breakpoint, Watch window, và Call stack dùng để làm gì khi debug?**

---

## 8. Git & Version Control

1. **Sự khác nhau giữa `git merge` và `git rebase`?**

2. **`git stash` dùng để làm gì? Khi nào dùng?**

3. **Gitflow workflow là gì? Giải thích các nhánh: `main`, `develop`, `feature`, `hotfix`.**

4. **Khi có conflict khi merge, bạn xử lý như thế nào?**

5. **`git cherry-pick` là gì? Khi nào dùng?**

6. **Sự khác nhau giữa `git reset` và `git revert`?**

7. **Pull Request (PR) / Merge Request (MR) là gì? Quy trình review code của bạn?**

---

## 9. MES / ERP & Phần Mềm Doanh Nghiệp

1. **MES (Manufacturing Execution System) và ERP (Enterprise Resource Planning) là gì? Sự khác nhau?**

2. **Bạn đã từng đọc spec / wireframe từ BA hoặc UI/UX và chuyển thành code chưa? Chia sẻ kinh nghiệm.**

3. **Khi nhận một yêu cầu từ BA nhưng không rõ ràng, bạn sẽ làm gì?**

4. **Multi-tenant architecture là gì? Có liên quan gì đến phần mềm doanh nghiệp không?**

5. **Bạn hiểu gì về quy trình nghiệp vụ như quản lý kho, sản xuất, đơn hàng?**

---

## 10. Soft Skills & Tư Duy

1. **Hãy kể về một dự án bạn tự hào nhất. Bạn đảm nhận phần nào? Khó khăn gì và giải quyết ra sao?**

2. **Khi deadline gấp mà bạn chưa hoàn thành task, bạn sẽ làm gì?**

3. **Khi bạn không đồng ý với một quyết định kỹ thuật của team, bạn xử lý như thế nào?**

4. **Mô tả quy trình bạn tự học một công nghệ mới.**

5. **Bạn quản lý task và ưu tiên công việc như thế nào khi có nhiều việc cùng lúc?**

6. **Làm thế nào bạn đảm bảo code của mình dễ bảo trì và người khác có thể đọc hiểu được?**

---

## 11. Câu Hỏi Tình Huống (Scenario-based)

1. **Hệ thống của bạn đang bị chậm ở một màn hình báo cáo với hàng triệu bản ghi. Bạn sẽ debug và tối ưu như thế nào?**
   > Gợi ý: index, pagination, caching, lazy loading, query optimization.

2. **Bạn được yêu cầu thêm một tính năng mới vào hệ thống legacy (code cũ, ít test). Bạn tiếp cận như thế nào?**

3. **Một API endpoint đang trả về lỗi 500 trong production. Bạn sẽ điều tra như thế nào?**

4. **Bạn cần thiết kế module quản lý nhân viên với các chức năng CRUD cơ bản. Hãy mô tả thiết kế database và API của bạn.**

5. **Khi merge code bạn gây ra bug cho tính năng của người khác, bạn xử lý như thế nào?**

---

## 12. Câu Hỏi Thường Gặp Cuối Buổi Phỏng Vấn

1. Bạn biết gì về công ty / sản phẩm của chúng tôi?
2. Kỳ vọng lương của bạn là bao nhiêu?
3. Bạn có câu hỏi gì cho chúng tôi không?
   > Gợi ý hỏi ngược: tech stack hiện tại, team size, quy trình onboarding, cơ hội học hỏi & phát triển.

---

## Tóm Tắt Checklist Ôn Tập

| Chủ đề | Mức độ ưu tiên |
|---|---|
| OOP & Design Patterns | ⭐⭐⭐ Cao |
| C# / Java core | ⭐⭐⭐ Cao |
| SQL & Database | ⭐⭐⭐ Cao |
| RESTful API | ⭐⭐⭐ Cao |
| Git workflow | ⭐⭐⭐ Cao |
| HTML / CSS / JS | ⭐⭐ Trung bình |
| Unit Testing | ⭐⭐ Trung bình |
| MES/ERP concepts | ⭐⭐ Trung bình |
| Soft skills | ⭐⭐ Trung bình |
