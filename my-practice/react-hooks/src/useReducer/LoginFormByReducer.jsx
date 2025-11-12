import { useReducer } from "react";

const login = (username, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (username === "admin" && password === "123456") {
        resolve({ token: "a-fake-tokrn" });
      } else {
        reject(new Error("username or password is wrong"));
      }
    }, 2000);
  });
};

//定义初始状态，集中管理所有的表单相关字段

const initialState = {
  username: "",
  password: "",
  usernameError: "",
  passwordError: "",
  submitError: null,
  isLoading: false,
  isSuccess: false,
};

//reducer负责根据action计算新的UI状态
const reducer = (state, action) => {
  switch (action.type) {
    case "CHANGE_USERNAME": {
      const value = action.payload;
      const usernameError =
        value.length > 3 ? "" : "Username has 3 characters at least";
      return {
        ...state,
        username: value,
        usernameError,
        submitError: null, //输入变更时要清理提交错误
      };
    }

    case "CHANGE_PASSWORD": {
      const value = action.payload;
      const passwordError =
        value.length > 6 ? "" : "Password has 6 characters at least";

      return {
        ...state,
        password: value,
        passwordError,
        submitError: null,
      };
    }

    case "SUBMIT_START": {
      return {
        ...state,
        isLoading: true,
        submitError: null,
      };
    }

    case "SUBMIT_SUCCESS": {
      return {
        ...initialState,
        isSuccess: true, //保留成功提示
      };
    }

    case "SUBMIT_CLIENT_ERROR": {
      return {
        ...state,
        submitError: action.payload,
      };
    }

    case "SUBMIT_FAILURE": {
      return {
        ...state,
        isLoading: false,
        submitError: action.payload,
        isSuccess: false,
      };
    }

    default:
      return state;
  }
};

export function LoginFormByReducer() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    username,
    password,
    usernameError,
    passwordError,
    submitError,
    isLoading,
    isSuccess,
  } = state;

  const handleUsernameChange = (e) => {
    dispatch({ type: "CHANGE_USERNAME", payload: e.target.value });
  };

  const handlePasswordChange = (e) => {
    dispatch({ type: "CHANGE_PASSWORD", payload: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (usernameError || passwordError) {
      return; //如果存在用户名或者密码错误，提前return阻止submit
    }

    if (!username || !password) {
      dispatch({
        type: "SUBMIT_CLIENT_ERROR",
        payload: "Please enter username and password",
      });
      return;
    }

    dispatch({ type: "SUBMIT_START" });

    try {
      await login(username, password);
      dispatch({ type: "SUBMIT_SUCCESS" });
    } catch (error) {
      dispatch({ type: "SUBMIT_FAILURE", payload: error.message });
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
      <h2>LoginFormByReducer</h2>
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

      {/* 调试信息：生产环境需移除 */}
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
