# 🖥️ SCREENS LIST - Danh sách Màn hình và Thành phần

Tài liệu này liệt kê chi tiết các màn hình người dùng và quản trị, kèm theo các thành phần (Components) và ghi chú liên quan.

---

## 1. Màn hình Đăng ký người dùng mới (新規ユーザー登録画面)
画面名： 新規ユーザー登録画面

項目：
　1. タイトル（Title）： 新規ユーザー登録ページのタイトル。
　2. 名前（Name input field）： ユーザーの名前を入力するフィールド。
　3. 姓（Family name input field）： ユーザーの姓を入力するフィールド。
　4. ユーザー名（Username input field）： ログイン用のユーザー名を入力するフィールド。
　5. メールアドレス（Email input field）： 有効なメールアドレスを入力するフィールド。
　6. パスワード（Password input field）： ログインに使用するパスワードを入力するフィールド。
　7. パスワード確認（Password confirmation input field）： 入力したパスワードを再度確認のために入力するフィールド。
　8. サインアップボタン（Sign up button）： 入力内容を送信して新規登録を完了するボタン。
　9. ログイン（Login ）： 登録済みのユーザーがログイン画面へ移動するためのリンク。

備考：
　・必須項目を未入力の場合、エラーメッセージを表示。
　・登録完了後はログイン画面へ自動遷移する。

Tên màn hình: Màn hình đăng ký người dùng mới

Thành phần:
　1. Tiêu đề: Tiêu đề của trang đăng ký người dùng mới.
　2. Trường nhập tên: Nơi người dùng nhập tên của mình.
　3. Trường nhập họ: Nơi người dùng nhập họ của mình.
　4. Trường nhập tên người dùng: Dùng để tạo tên đăng nhập cho tài khoản.
　5. Trường nhập email: Nhập địa chỉ email hợp lệ của người dùng.
　6. Trường nhập mật khẩu: Nhập mật khẩu để đăng nhập vào hệ thống.
　7. Trường xác nhận mật khẩu: Nhập lại mật khẩu để xác nhận trùng khớp.
　8. Nút đăng ký: Gửi thông tin để hoàn tất tạo tài khoản mới.
　9. Đăng nhập: Dẫn đến trang đăng nhập cho người đã có tài khoản.

Ghi chú:
　・Nếu bỏ trống trường bắt buộc, hệ thống sẽ hiển thị thông báo lỗi.
　・Sau khi đăng ký thành công, người dùng được chuyển đến màn hình đăng nhập.					

## 2. Màn hình Đăng nhập (ログイン画面 - 認証画面)
画面名： ログイン画面（認証画面）

項目：
　1. タイトル（Title）： ログインページのタイトル。
　2. ユーザーIDまたはメールアドレス（User ID / Email input field）： 登録済みのユーザーまたは管理者がIDまたはメールアドレスを入力するフィールド。
　3. パスワード（Password input field）： 登録時に設定したパスワードを入力するフィールド。
　4. ログインボタン（Login button）： 入力情報を送信して、認証を実行するボタン。
　5. 新規登録（Sign up link）： 新しいユーザーがアカウント登録ページへ移動するためのリンク。

備考：
　・ユーザーおよび管理者の両方が利用可能。
　・認証成功後、ユーザーはマイページへ、管理者はダッシュボードへ遷移。
　・入力情報が誤っている場合、エラーメッセージを表示。
　・セキュリティ強化のため、入力値はマスク表示（●●●）にする。

Tên màn hình: Màn hình đăng nhập

Thành phần:
　1. Tiêu đề: Tiêu đề của trang đăng nhập.
　2. Trường nhập ID người dùng hoặc Email: Dành cho người dùng hoặc quản trị viên nhập ID hoặc địa chỉ email đã đăng ký.
　3. Trường nhập mật khẩu: Nhập mật khẩu đã đăng ký khi tạo tài khoản.
　4. Nút đăng nhập: Gửi thông tin đăng nhập để xác thực và truy cập hệ thống.
　5. Liên kết “Đăng ký mới”: Dẫn đến trang tạo tài khoản cho người dùng mới.

Ghi chú:
　・Áp dụng cho cả người dùng và quản trị viên.
　・Sau khi đăng nhập thành công: người dùng chuyển đến trang cá nhân, quản trị viên chuyển đến trang quản trị.
　・Nếu nhập sai thông tin, hệ thống sẽ hiển thị thông báo lỗi.
　・Trường mật khẩu được ẩn ký tự (●●●) để bảo đảm an toàn.

## 3. Màn hình Trang chủ (ホーム画面)
画面名： ホーム画面

項目：

1. ホームボタン： 現在のホーム画面を表示するためのメニューボタン。
2. ストーリーボタン： 投稿一覧またはストーリー画面へ移動するボタン。
3.ドキュメントボタン： 資料共有画面への遷移ボタン。
4. 通知ボタン： 最新のコメント・リアクションなどを確認するためのボタン。
5. 人気トピックボタン： 人気投稿や話題のトピックを確認するメニュー。
6. ログアウトボタン： システムからログアウトするボタン。
7. ユーザー名表示： 現在ログインしているユーザー名を表示。
8. 挨拶テキスト： ユーザーに対して「おかえり！」などのメッセージを表示。
9. 投稿者情報： 投稿した教師の名前と投稿時間を表示。
10.ドキュメントタイトルと形式： 投稿に添付された資料のタイトルとファイルタイプ（PDFなど）を表示。
11. 投稿内容： 教師が共有した本文や説明文を表示。

備考：
・最新の投稿が時系列順に表示される。
・資料投稿にはPDF、Wordなどの形式が含まれる。
・ユーザーは他の投稿にアクセスしてコメント・リアクションできる。

Tên màn hình: Màn hình Trang chủ

Thành phần:
1. Nút Home: Hiển thị trang chủ hiện tại.
2. Nút Story: Dẫn đến trang danh sách hoặc chi tiết bài đăng chia sẻ.
3. Nút Document: Mở màn hình chia sẻ và quản lý tài liệu.
4. Nút Notification: Hiển thị thông báo mới như bình luận, cảm xúc, bài đăng mới.
5. Nút Popular Topics: Hiển thị các bài viết và chủ đề phổ biến.
6. Nút Logout: Thoát khỏi hệ thống.
7. Tên người dùng: Hiển thị tên của người dùng đang đăng nhập.
8. Lời chào: Hiển thị thông báo chào mừng người dùng (“Chào mừng trở lại!”).
9. Thông tin người đăng: Hiển thị tên giáo viên và thời gian đăng bài.
10. Tiêu đề và định dạng tài liệu: Hiển thị tên tài liệu và loại file (ví dụ: PDF).
11. Nội dung bài viết: Hiển thị mô tả hoặc nội dung chia sẻ của bài đăng.

Ghi chú:
・Các bài đăng được hiển thị theo thứ tự thời gian.
・Tài liệu đính kèm có thể là PDF, Word, Excel...
・Người dùng có thể xem, bình luận hoặc thả cảm xúc cho bài viết khác.

## 4. Màn hình Bài đăng / Chia sẻ (ストーリー画面)
画面名： ストーリー画面

項目：
1. ストーリーメニュー： 現在選択中のストーリー画面を示すメニュー。
2. 投稿者情報： 投稿者のユーザー名と投稿日時を表示。
3. ユーザーアイコン： 投稿者のプロフィール画像を表示。
4. ストーリー追加ボタン： 新しいストーリーを作成するためのボタン。
5. ストーリー内容： 投稿された本文・画像などを表示。
6. リアクションエリア： 「いいね」「愛」「ははは」「サポート」など、リアクションを表示・送信できるエリア。

備考：
・投稿は最新順で表示。
・投稿者は自分の投稿を編集または削除可能。
・リアクション数は自動更新される。

Tên màn hình: Màn hình Bài đăng / Chia sẻ

Thành phần:
1. Menu Story: Thể hiện người dùng đang ở màn hình bài chia sẻ.
2. Thông tin người đăng: Hiển thị tên người đăng và thời gian đăng bài.
3. Ảnh đại diện người dùng: Hiển thị hình đại diện của người đăng.
4. Nút Thêm bài viết: Cho phép tạo một bài chia sẻ mới.
5. Nội dung bài viết: Hiển thị nội dung chính của bài đăng (văn bản, hình ảnh).
6. Khu vực cảm xúc: Hiển thị và gửi các biểu tượng cảm xúc như “Thích”, “Yêu thích”, “Hỗ trợ”.

Ghi chú:
・Bài viết hiển thị theo thứ tự mới nhất.
・Người đăng có thể chỉnh sửa hoặc xóa bài viết của mình.
・Số lượt cảm xúc tự động cập nhật khi có thay đổi.

## 5. Màn hình Quản lý Tài liệu (ドキュメント管理画面)
画面名： ドキュメント管理画面

項目：
1.ドキュメントメニュー： 資料一覧画面を開くためのメニュー。
2. セクションタイトル： 「あなたが投稿する文書」— 自分が投稿した資料一覧を示す。
3. アップロードボタン： 新しい資料をアップロードするボタン。
4. フィルター領域： ファイルタイプやカテゴリーで絞り込み検索できる。
5. ドキュメント名： 資料のファイル名を表示。
6. タイプ： PDF、Excel、Word、画像などのファイル種別を表示。
7. アップロード者： 資料を投稿したユーザー名を表示。
8. 日付： アップロードした日付を表示。
9. アクション： 「ダウンロード」「表示」などの操作を提供。
10. 保存した文書： ユーザーがブックマークまたは保存した資料の一覧。

備考：
・アップロード時にファイル形式とサイズを自動チェック。
・検索結果は関連度または日付順で並ぶ。
・保存済み資料はお気に入りとして再利用可能。

Tên màn hình: Màn hình Quản lý Tài liệu

Thành phần:
1. Menu Document: Mở danh sách tài liệu.
2. Tiêu đề khu vực: “Các tài liệu bạn đã đăng tải”.
3. Nút Tải lên tài liệu: Cho phép người dùng đăng tải tệp mới.
4. Bộ lọc: Lọc theo loại tệp hoặc danh mục.
5. Tên tài liệu: Hiển thị tên file được chia sẻ.
6. Loại tệp: Hiển thị định dạng file (PDF, Excel, Word…).
7. Người tải lên: Hiển thị tên người đăng tài liệu.
8. Ngày đăng: Hiển thị ngày đăng tải.
9. Hành động: Cung cấp lựa chọn “Tải xuống” hoặc “Xem”.
10. Tài liệu đã lưu: Danh sách tài liệu người dùng đã lưu lại.

Ghi chú:
・Khi tải lên, hệ thống kiểm tra định dạng và dung lượng tệp.
・Danh sách có thể sắp xếp theo mức độ liên quan hoặc ngày đăng.
・Các tài liệu đã lưu được hiển thị trong phần “Yêu thích”.

## 6. Màn hình Thông báo (通知一覧画面)
画面名： 通知一覧画面

項目：
1. 通知メニュー： 通知機能にアクセスするためのメニュー。
2. 通知フィルター： 「すべての通知」「未読のみ」などを選択できるドロップダウン。
3. 一括既読ボタン： すべての通知を既読に変更するボタン。
4. 通知カード： 通知内容・発生時間・関連投稿へのリンクを表示。

備考：
・未読通知は青色背景でハイライト表示。
・クリックすると自動で既読に変更される。
・通知は最新順で表示され、リアルタイム更新される。

Tên màn hình: Màn hình Thông báo

Thành phần:
1. Menu Thông báo: Truy cập vào danh sách thông báo.
2. Bộ lọc thông báo: Chọn hiển thị “Tất cả thông báo” hoặc “Chưa đọc”.
3. Nút Đánh dấu tất cả là đã đọc: Đánh dấu toàn bộ thông báo là đã xem.
4. Thẻ thông báo: Hiển thị nội dung tóm tắt, thời gian và liên kết đến bài đăng hoặc bình luận liên quan.

Ghi chú:
・Thông báo chưa đọc được tô nổi bật bằng màu nền.
・Khi nhấp vào, thông báo sẽ tự động chuyển sang trạng thái “đã đọc”.
・Danh sách được hiển thị theo thứ tự mới nhất và cập nhật theo thời gian thực.

## 7. Màn hình Chủ đề / Bài viết phổ biến (人気トピック・ランキング画面)
画面名： 人気トピック・ランキング画面

項目：
1. 人気トピックメニュー： 現在表示中のランキングメニュー。
2. ランク列： 投稿の順位を表示。
3. 投稿リスト： ストーリータイトル、教師名、トピック名、いいね数、コメント数、スコアを一覧で表示。
4.トレンドトピックセクション： 今週の注目トピックを表示。
5.トピック詳細リンク： トピック詳細ページまたは関連投稿一覧へのリンク。

備考：
・ランキングは「いいね数」「コメント数」「スコア」に基づいて自動計算。
・トレンドトピックは週単位で更新される。
・ユーザーは人気投稿から話題のテーマへ簡単にアクセスできる。

Tên màn hình: Màn hình Chủ đề / Bài viết phổ biến

Thành phần:
1. Menu Chủ đề phổ biến: Hiển thị menu của bảng xếp hạng hiện tại.
2. Cột xếp hạng: Hiển thị thứ hạng của từng bài viết.
3. Danh sách bài viết: Bao gồm tiêu đề bài viết, tên giáo viên, tên chủ đề, số lượt thích, bình luận và điểm đánh giá.
4. Mục Chủ đề thịnh hành trong tuần: Hiển thị các chủ đề đang được quan tâm nhiều nhất.
5. Liên kết chi tiết chủ đề: Dẫn đến trang chi tiết hoặc danh sách bài đăng thuộc chủ đề đó.

Ghi chú:
・Bảng xếp hạng được tính tự động dựa trên lượt thích, bình luận và điểm trung bình.
・Các chủ đề thịnh hành được cập nhật hàng tuần.
・Người dùng có thể truy cập nhanh vào các bài viết và chủ đề nổi bật trong cộng đồng.

## 8. Màn hình Bảng điều khiển quản trị (管理者ダッシュボード画面)
画面名：管理者ダッシュボード画面

項目：
1. 管理メニュー：ダッシュボード、メンバー管理、トピック管理など、管理者用のナビゲーション。
2. メンバー管理ボタン：メンバー管理画面へ遷移するメニュー項目。
3. トピック管理ボタン：トピック管理画面へ遷移するメニュー項目。
4. 管理者情報：ログイン中の管理者名（例：Admin）を表示する領域。
5. 主要メトリクス：総登録数、当月アクティブ数、総ストーリー数、共有ドキュメント数などのカード表示。
6. アクティビティ傾向（グラフ）：過去30日間の投稿・アクティビティ推移を示すチャート領域。
7. 最近のアクティビティ一覧：直近のストーリー投稿、ドキュメント共有、トピック作成、コメント等の履歴テーブル。

備考：
・管理者専用画面で一般ユーザーはアクセス不可。
・メトリクスとアクティビティは定期更新／またはリアルタイム反映。
・最近のアクティビティの各行から該当コンテンツへ遷移可能。

Tên màn hình: Màn hình Bảng điều khiển quản trị

Các thành phần:
1. Menu quản trị: Điều hướng dành cho quản trị (Dashboard, Quản lý thành viên, Quản lý chủ đề...).
2. Nút quản lý thành viên: Mở màn hình quản lý thành viên.
3. Nút quản lý chủ đề: Mở màn hình quản lý chủ đề.
4. Thông tin quản trị viên: Vùng hiển thị tên quản trị viên đang đăng nhập (ví dụ: Admin).
5. Các chỉ số chính: Thẻ hiển thị tổng số đăng ký, số hoạt động trong tháng, tổng số bài, số tài liệu chia sẻ, v.v.
6. Biểu đồ xu hướng hoạt động: Biểu đồ thể hiện hoạt động trong 30 ngày gần nhất.
7. Danh sách hoạt động gần đây: Bảng lịch sử hành động gần nhất (đăng bài, chia sẻ tài liệu, tạo chủ đề, comment...).

Ghi chú:
・Màn hình chỉ dành cho quản trị; người dùng thường không truy cập được.
・Chỉ số và hoạt động được cập nhật định kỳ hoặc theo thời gian thực.
・Từ từng mục hoạt động có thể nhảy tới nội dung liên quan.

## 9. Màn hình Quản lý thành viên (メンバー管理画面)
画面名：メンバー管理画面

項目：
1. メンバー管理メニュー：左側ナビの「メンバー管理」選択領域。
2. 管理者情報：画面右上に表示される管理者名領域。
3. フィルター／追加領域：ロール選択ドロップダウンと「＋新規メンバーを追加」ボタン。
4. メンバー一覧テーブル：ID、氏名、メールアドレス、ロール、参加日、ステータス、アクション列（編集・表示・停止など）。
5. 新規メンバー追加セクション見出し：フォーム開始を示す見出し。
6. フルネーム入力欄：新規メンバーの氏名入力フィールド。
7. メールアドレス入力欄：新規メンバーのメールアドレス入力フィールド。
8. ロール選択：役割（教師／管理者／モデレーター等）を選ぶドロップダウン。
9. 部門選択：所属部門を選択するフィールド（任意）。
10. メンバー追加ボタン：入力内容を送信して新規登録するボタン。
11. キャンセルボタン：フォーム入力をキャンセルするボタン。

備考：
・入力エラー時は各フィールドにエラーメッセージを表示。
・追加後はメンバー一覧に即反映。
・一覧の「停止」や「編集」は管理者権限で実行。

Tên màn hình: Màn hình Quản lý thành viên

Các thành phần:
1. Menu quản lý thành viên: Vùng chọn “Quản lý thành viên” ở navigation bên trái.
2. Thông tin quản trị viên: Vùng hiển thị tên admin ở góc phải trên.
3. Khu vực bộ lọc: Dropdown chọn role và nút 
4. Bảng danh sách thành viên: Hiển thị ID, tên, email, vai trò, ngày tham gia, trạng thái, cột hành động (xem -> hiển thị modal chi tiết người dùng / inactive tài khoản).
5. Tiêu đề phần thêm thành viên mới: Dấu hiệu bắt đầu form thêm mới.
6. Trường nhập họ tên đầy đủ: Nhập tên thành viên mới -> bỏ
7. Trường nhập email: Nhập email hợp lệ cho thành viên -> bỏ
8. Chọn vai trò: Dropdown chọn role (giáo viên / admin). -> bỏ
9. Chọn phòng ban: Chọn bộ phận (nếu có). -> bỏ
10. Nút thêm thành viên: Gửi form để thêm thành viên mới vào DB. -> bỏ
11. Nút hủy: Hủy thao tác nhập liệu. -> bỏ

Ghi chú:
・Nếu nhập sai/sơ suất, hiển thị lỗi tương ứng trên trường.
・Sau khi thêm, danh sách cập nhật ngay.
・Các thao tác quản lý chỉ thực thi bởi admin.

## 10. Màn hình Tạo chủ đề (トピック作成画面)
画面名：トピック作成画面

項目：
1.トピック名入力欄：トピックのタイトルを入力するフィールド（例：「学生の集中力向上」）。
2. 説明テキストエリア：トピックの目的やディスカッションの焦点を記入する大きめのテキストエリア。
3. カテゴリー選択：関連するカテゴリを選択するドロップダウン（例：教育方法など）。
4.トピック作成ボタン：入力内容を保存してトピックを作成するボタン。
5. 既存のトピック見出し：「既存のトピック」セクションの見出し。
6. 既存トピック一覧テーブル：トピック名、説明、ストーリー数、コメント数、作成日、アクション（編集・表示）を表示。

備考：
・作成されたトピックは即時公開され、ホーム等に表示される。
・編集・削除・ピン留めは管理者権限で実行可能。
・トピックごとの投稿数・コメント数が統計に反映される。

Tên màn hình: Màn hình Tạo chủ đề

Các thành phần:
1. Trường nhập tên chủ đề: Nhập tiêu đề topic (ví dụ: “Nâng cao tập trung học sinh”).
2. Vùng mô tả: Textarea để mô tả mục tiêu/thang thảo luận.
3. Chọn danh mục: Dropdown chọn category liên quan (ví dụ: Phương pháp giảng dạy).
4. Nút tạo topic: Lưu và tạo chủ đề mới.
5. Tiêu đề phần “Chủ đề hiện có”: Dấu hiệu bắt đầu danh sách chủ đề đã tạo.
6. Bảng danh sách chủ đề hiện có: Hiển thị tên chủ đề, mô tả ngắn, số bài (stories), số comment, ngày tạo, cột hành động (sửa / xem).

Ghi chú:
・Sau khi tạo, chủ đề được công khai ngay và hiện trên trang chính.
・Chỉ admin có quyền chỉnh sửa/xóa/ghim.
・Số liệu bài viết/bình luận cập nhật cho mục phân tích.

Tên màn hình: Màn hình Hồ sơ người dùng
Các thành phần:
1. Khu vực avatar:
　Hiển thị ảnh đại diện của người dùng. Nếu chưa thiết lập thì hiển thị avatar mặc định.
2. Tên người dùng:
　Hiển thị username của tài khoản (ví dụ: “user”).
3. Nút hành động:
　Khu vực chứa nút Theo dõi và các nút phụ như cài đặt.
4. Trường thông tin hồ sơ:
　Khu vực hiển thị thông tin người dùng, bao gồm:
　・Số người theo dõi
　・Số đang theo dõi
　・Môn học đã dạy
　・Nơi làm việc trước đây
　・Nơi đang giảng dạy hiện tại
5. Tab Bài đăng:
　Tab dùng để hiển thị các bài đăng của người dùng.
6. Tab Đã lưu:
　Tab hiển thị các bài viết mà người dùng đã lưu.
7. Khu vực hiển thị nội dung:
　Hiển thị bài đăng hoặc bài đã lưu tương ứng với tab đang được chọn.
