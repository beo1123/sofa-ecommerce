
# Contributing to Sofa Ecommerce

Cảm ơn bạn đã muốn đóng góp! Dưới đây là hướng dẫn để đóng góp trơn tru.

## Branch & PR workflow

- Base branch: `main`
- Branch naming:
  - `feature/<short-desc>` — tính năng mới
  - `fix/<short-desc>` — sửa lỗi
  - `hotfix/<short-desc>` — fix khẩn cấp production
  - `release/<version>` — chuẩn bị release
- Tạo Pull Request từ feature → `main`. PR nên nhỏ & có mục đích rõ ràng.

## Commit messages

Dùng **Conventional Commits**:

Husky + commitlint sẽ kiểm tra commit message. Đảm bảo `pnpm prepare` đã chạy để kích hoạt husky.

## Trước khi commit / push

- Chạy `pnpm lint` và fix warnings/errors.
- Viết/ cập nhật tests nếu thay đổi logic.
- Chạy `pnpm test` (nếu có).

## Pull Request checklist

- [ ] CI passes (lint, build, tests)
- [ ] At least 1 approval from reviewer
- [ ] No `TODO`/`console.log` left
- [ ] Docs updated if necessary

## How to add tests

- Unit tests: Jest + React Testing Library (placeholder)
- E2E tests: Playwright (placeholder)
- Run tests:
```bash
pnpm test
pnpm test:e2e
