<script lang="ts">
import { Vue, Options } from 'vue-class-component';
import { View } from 'bwcx-client-vue3';
import { ElForm, ElFormItem, ElInput, ElButton } from 'element-plus';
import type { ApiClientType } from '@client/api';

@View('/login')
@Options({
  components: {
    ElForm,
    ElFormItem,
    ElInput,
    ElButton,
  },
  inject: ['apiClient'],
})
export default class LoginView extends Vue {
  // 声明注入的 apiClient
  declare apiClient: ApiClientType;

  state = {
    username: '',
    password: '',
  }



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
        this.$router.push('/');
      } else {
        alert('Login failed: ' + res.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: Network error');
    }
  }
}
</script>

<template>
  <div class="login-view">
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
  </div>
</template>

<style scoped lang="less">
.login-view {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  & .login-container {
    width: 100%;
    max-width: 600px;
    padding: 20px;
    box-shadow: 0 0px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    background-color: #fff;
  }
}
</style>
