// Japanese messages for the application
export const MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: "ログインに成功しました。",
    LOGIN_FAILED: "ユーザー名またはパスワードが間違っています。",
    REGISTER_SUCCESS: "アカウントが作成されました。ログインしてください。",
    REGISTER_FAILED: "登録に失敗しました。",
    LOGOUT_SUCCESS: "ログアウトしました。",
    PASSWORD_MISMATCH: "パスワードが一致しません。",
    USERNAME_REQUIRED: "ユーザー名は必須です。",
    PASSWORD_REQUIRED: "パスワードは必須です。",
    EMAIL_REQUIRED: "メールアドレスは必須です。",
    FIRSTNAME_REQUIRED: "名前は必須です。",
    LASTNAME_REQUIRED: "姓は必須です。",
    USERNAME_EXISTS: "このユーザー名は既に使用されています。",
    EMAIL_EXISTS: "このメールアドレスは既に使用されています。",
    ACCOUNT_INACTIVE: "アカウントがアクティブではありません。",
  },

  PASSWORD_STRENGTH: {
    WEAK_LENGTH: "パスワードは少なくとも8文字必要です。",
    WEAK_COMPLEXITY:
      "パスワードは大文字、小文字、数字、記号のうち2種類以上を含む必要があります。",
    MEDIUM: "パスワードの強度は中程度です。",
    STRONG: "パスワードの強度は十分です。",
  },

  UI: {
    LOGIN: "ログイン",
    REGISTER: "サインアップ",
    LOGOUT: "ログアウト",
    LOADING: "処理中...",
    CREATING: "作成中...",
    USERNAME_PLACEHOLDER: "ユーザー名",
    PASSWORD_PLACEHOLDER: "パスワード",
    CONFIRM_PASSWORD_PLACEHOLDER: "パスワードを確認する",
    EMAIL_PLACEHOLDER: "メール",
    FIRSTNAME_PLACEHOLDER: "名前",
    LASTNAME_PLACEHOLDER: "姓",
    SHOW_PASSWORD: "パスワードを表示",
    HIDE_PASSWORD: "パスワードを非表示",
    GENERATE_PASSWORD: "パスワードを生成",
    PASSWORD_GENERATED:
      "パスワードが生成され、クリップボードにコピーされました！",
    HAVE_ACCOUNT: "すでにアカウントをお持ちですか？",
    NO_ACCOUNT: "アカウントをお持ちでありませんか？",
    CREATE_ACCOUNT: "作成する",
  },

  NAVIGATION: {
    HOME: "ホーム",
    STORIES: "ストーリー",
    DOCUMENTS: "ドキュメント",
    NOTIFICATIONS: "通知",
    POPULAR_TOPICS: "人気トピック",
    WELCOME_BACK: "おかえり！",
  },
};

export default MESSAGES;
