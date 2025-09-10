import type { ApiClientType } from '@client/api';
import type { App } from 'vue';
import { API_CLIENT_TOKEN } from '@client/api';

export class ApiClientPlugin {
  public static install(app: App, options: { apiClient: ApiClientType }) {
    app.config.globalProperties.$api = options.apiClient;
    // 同时提供给 inject API 使用
    app.provide(API_CLIENT_TOKEN, options.apiClient);
    // 提供 apiClient 名称供 class component 注入
    app.provide('apiClient', options.apiClient);
  }
}
