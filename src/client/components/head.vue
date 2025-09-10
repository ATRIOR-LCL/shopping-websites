<script lang="ts">
import { Vue, Options } from 'vue-class-component';
import { ElDropdown, ElDropdownMenu, ElDropdownItem, ElIcon, ElAvatar } from 'element-plus';
import { ArrowDown } from '@element-plus/icons-vue';
import { ClientOnly } from 'vite-ssr';
import { Prop } from 'vue-property-decorator';
import { AsyncDataOptions } from '@client/typings';
import { ApiClient } from '@common/api/api-client';


@Options({
  components: {
    ElDropdown,
    ElDropdownMenu,
    ElDropdownItem,
    ClientOnly,
    ElIcon,
    ArrowDown,
    ElAvatar,
  },
  inject: ['apiClient'],
})
export default class Head extends Vue {
  declare apiClient: ApiClient;
  @Prop({type: String, default: "Guest"}) username: string;
  avatarUrl = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

  async handleLogout() {
    try {
      const res = await this.apiClient.logout();
      console.log('Logout response:', res);

      // 登出成功后跳转到登录页
      if (res.success) {
        this.$router.push('/login');
      } else {
        alert('Logout failed: ' + res.message);
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Logout failed: Network error');
    }
  }
}
</script>

<template>
  <header class="app-header">
    <h1 style="font-size: var(--font-large-size); font-weight: 700">Hello Shopping 😎</h1>
    <client-only>
      <h2>Hi {{ username }}!</h2>
      <el-dropdown class="my-dropdown">
        <el-avatar :src="avatarUrl" :size="35" />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="this.$emit('cart-clicked')">Cart</el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">Log Out</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </client-only>
  </header>
</template>

<style scoped lang="less">
.app-header {
  position: fixed;
  top: 0;
  width: 100vw;
  height: 70px;
  background-color: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;
  padding: 0 30px;
}
.mydropdown {
  &:hover {
    outline: none;
    border: none;
  }
}
.example-showcase .el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}
</style>
