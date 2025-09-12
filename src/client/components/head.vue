<script lang="ts">
import { Vue, Options } from 'vue-class-component';
import { ElDropdown, ElDropdownMenu, ElDropdownItem, ElIcon, ElAvatar } from 'element-plus';
import { ArrowDown } from '@element-plus/icons-vue';
import { ClientOnly } from 'vite-ssr';
import { Prop } from 'vue-property-decorator';
import { ApiClient } from '@common/api/api-client';
import { ShoppingTrolley, SwitchButton, UserFilled } from '@element-plus/icons-vue';
@Options({
  components: {
    ElDropdown,
    ElDropdownMenu,
    ElDropdownItem,
    ClientOnly,
    ElIcon,
    ArrowDown,
    ElAvatar,
    ShoppingTrolley,
    SwitchButton,
    UserFilled,
  },
  inject: ['apiClient'],
})
export default class Head extends Vue {
  declare apiClient: ApiClient;
  @Prop({ type: String, default: 'Guest' }) username: string;
  @Prop({ type: String, default: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png' }) avatarURL: string;

  get avatarUrl() {
    return this.avatarURL || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';
  }

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
  updated() {
    console.log('Header component updated');
  }
}
</script>

<template>
  <header class="app-header">
    <router-link to="/" style="font-size: var(--font-large-size); font-weight: 700; text-decoration: none; color: #000;">Hello Shopping 😎</router-link>
    <client-only>
      <el-dropdown class="my-dropdown">
        <el-avatar :src="avatarUrl" :size="35" />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item text @click="this.$router.push('/profile')">
              <el-icon><UserFilled /></el-icon>
              <p>Profile</p>
            </el-dropdown-item>
            <!-- <el-dropdown-item divided disabled></el-dropdown-item> -->
            <el-dropdown-item @click="this.$emit('cart-clicked')">
              <el-icon><ShoppingTrolley /></el-icon>
              <p>Cart</p>
            </el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              <p>Log Out</p>
            </el-dropdown-item>
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
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(15px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;
  padding: 0 50px;
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
