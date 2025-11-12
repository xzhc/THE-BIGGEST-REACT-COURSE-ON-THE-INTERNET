import { useState } from "react";
const login = (username, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (username === "admin" && password === "123456") {
        resolve({ token: "fake-jwt-token" });
      } else {
        reject(new Error("Username or Password is wrong"));
      }
    }, 2000);
  });
};

export function LoginFormByState() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleUsernameChange = (e) => {
    e.preventDefault();
    const value = e.target.value;
    setUsername(value);
    setUsernameError(
      value.length < 3 ? "Username has 3 characters at least" : ""
    );
    setSubmitError(null);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    const value = e.target.value;
    setPassword(value);
    setPasswordError(
      value.length < 6 ? "Password has 6 characters at least" : ""
    );
    setSubmitError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (usernameError || passwordError) {
      return;
    }
    if (!username || !password) {
      setSubmitError("Please enter username and password");
      return;
    }

    setIsLoading(true);
    setSubmitError(null);
    setIsSuccess(false);

    try {
      await login(username, password);
      setIsLoading(false);
      setIsSuccess(true);
      setUsername("");
      setPassword("");
      setUsernameError("");
      setPasswordError("");
    } catch (error) {
      setIsLoading(false);
      setSubmitError(error.message);
      setIsSuccess(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ddd",
      }}
    >
      <h2>LoginFormByState</h2>
      <form onSubmit={handleSubmit}>
        {/* 用户名输入框 */}
        <div style={{ marginBottom: "15px" }}>
          <label>
            用户名：
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              disabled={isLoading}
              style={{
                display: "block",
                width: "100%",
                marginTop: "5px",
                borderColor: usernameError ? "red" : "#ccc",
              }}
            />
          </label>
          {usernameError && (
            <div style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>
              {usernameError}
            </div>
          )}
        </div>

        {/* 密码输入框 */}
        <div style={{ marginBottom: "15px" }}>
          <label>
            密码：
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              disabled={isLoading}
              style={{
                display: "block",
                width: "100%",
                marginTop: "5px",
                borderColor: passwordError ? "red" : "#ccc",
              }}
            />
          </label>
          {passwordError && (
            <div style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>
              {passwordError}
            </div>
          )}
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={isLoading || !!usernameError || !!passwordError}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: isLoading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "登录中..." : "登录"}
        </button>

        {/* 全局错误提示 */}
        {submitError && (
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              backgroundColor: "#fee",
              color: "red",
              borderRadius: "4px",
            }}
          >
            ❌ {submitError}
          </div>
        )}

        {/* 成功提示 */}
        {isSuccess && (
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              backgroundColor: "#efe",
              color: "green",
              borderRadius: "4px",
            }}
          >
            ✅ 登录成功！
          </div>
        )}
      </form>

      {/* 💀 调试：查看当前所有状态（生产环境要删除） */}
      <details style={{ marginTop: "20px", fontSize: "12px" }}>
        <summary>查看所有状态（调试用）</summary>
        <pre
          style={{
            backgroundColor: "#f5f5f5",
            padding: "10px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(
            {
              username,
              password: "***",
              usernameError,
              passwordError,
              isLoading,
              submitError,
              isSuccess,
            },
            null,
            2
          )}
        </pre>
      </details>

      <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
        💡 提示：尝试用 admin/123456 登录
      </div>
    </div>
  );
}
