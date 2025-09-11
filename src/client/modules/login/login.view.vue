<script lang="ts">
import { Vue, Options } from 'vue-class-component';
import { View } from 'bwcx-client-vue3';
import { ElForm, ElFormItem, ElInput, ElButton, ElNotification } from 'element-plus';
import type { ApiClientType } from '@client/api';
import MyFooter from '@client/components/my-footer.vue';

@View('/login')
@Options({
  components: {
    ElForm,
    ElFormItem,
    ElInput,
    ElButton,
    MyFooter,
  },
  inject: ['apiClient'],
})
export default class LoginView extends Vue {
  declare apiClient: ApiClientType;

  state = {
    username: '',
    password: '',
  };

  handleReset() {
    this.state.username = '';
    this.state.password = '';
  }

  async handleLogin() {
    try {
      const res = await this.apiClient.login({
        username: this.state.username,
        password: this.state.password,
      });
      console.log('Login response:', res);

      // 登录成功后跳转到首页
      if (res.success) {
        ElNotification.success({
          title: '登录成功',
          message: '欢迎回来，' + this.state.username + '！',
          duration: 1000
        });
        this.$router.push('/');
      } else {
        ElNotification.error({
          title: '登录失败',
          message: '请检查您的用户名和密码。',
          duration: 1000
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      ElNotification.error({
        title: '登录失败',
        message: '网络错误，请稍后再试。',
        duration: 1000
      });
    }
  }
}
</script>

<template>
  <div class="login-view">
    <h1 class="login-title">Log in to start shopping 🤨</h1>
    <div class="login-container">
      <el-form style="max-width: 600px" status-icon label-width="auto">
        <el-form-item label="UserName" prop="username">
          <el-input type="text" autocomplete="off" v-model="state.username" />
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input type="password" autocomplete="off" v-model="state.password" />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleLogin"> Submit </el-button>
          <el-button @click="handleReset">Reset</el-button>
        </el-form-item>
      </el-form>
    </div>
    <MyFooter />
  </div>
</template>

<style scoped lang="less">
.login-view {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;

  & .login-container {
    width: 100%;
    max-width: 600px;
    padding: 20px;
    box-shadow: 0 0px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    background-color: #fff;
  }
  & .login-title {
    text-align: center;
    margin-bottom: 20px;
    font-size: var(--font-large-size);
    font-weight: bold;
  }
}
</style>
