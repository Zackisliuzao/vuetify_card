import type { AxiosError, AxiosResponse } from 'axios';
import axios from 'axios';

// axios.defaults.baseURL = 'http://127.0.0.1:8000';
axios.interceptors.request.use(function (config) {
  console.log("请求开始");
  // 在发送请求之前做些什么
  return config;
}, function (error) {
  // 对请求错误做些什么
  console.log("请求错误");
  return Promise.reject(error);
});

// 响应拦截器
axios.interceptors.response.use(
  (response: AxiosResponse) => {
    // 这里可以对业务状态码统一处理
    if (response.data && response.data.code && response.data.code !== 0) {
      // 抛出业务错误
      return Promise.reject({
        type: "business",
        message: response.data.message || "业务错误",
        data: response.data,
      });
    }
    return response;
  },
  (error: AxiosError) => {
    // 这里进行网络异常统一处理
    let message = "未知错误";
    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = "请求错误(400)";
          break;
        case 401:
          message = "未授权(401)";
          break;
        case 403:
          message = "拒绝访问(403)";
          break;
        case 404:
          message = "请求地址不存在(404)";
          break;
        case 500:
          message = "服务器错误(500)";
          break;
        default:
          message = `连接出错(${error.response.status})`;
      }
    } else if (error.request) {
      message = "网络异常，无法连接服务器";
    } else {
      message = `请求配置错误: ${error.message}`;
    }

    // 抛出网络错误
    return Promise.reject({
      type: "network",
      message: message,
    });
  }
);