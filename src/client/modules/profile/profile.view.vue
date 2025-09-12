<script lang="ts">
import { Vue, Options } from 'vue-class-component';
import { View } from 'bwcx-client-vue3';
import { RenderMethod, RenderMethodKind } from 'bwcx-client-vue3';
import MyFooter from '@client/components/my-footer.vue';
import { ElIcon, ElMessage, ElCard, ElButton } from 'element-plus';
import { Upload } from '@element-plus/icons-vue';
import { ApiClientType } from '@client/api';
import { ClientOnly } from 'vite-ssr';

@View('/profile')
@Options({
  components: {
    MyFooter,
    ElIcon,
    Upload,
    ClientOnly,
    ElCard,
    ElButton,
  },
  inject: ['apiClient'],
})
@RenderMethod(RenderMethodKind.SSR)
export default class ProfileView extends Vue {
  declare apiClient: ApiClientType;

  // 组件数据属性
  userAvatar: string = '../../assets/atrior.png';
  uploading: boolean = false;
  username: string = '';

  $refs!: {
    fileInput: HTMLInputElement;
  };

  // 组件挂载后获取用户信息
  async mounted() {
    await this.loadUserInfo();
  }

  // 加载用户信息
  async loadUserInfo() {
    try {
      const session = await this.apiClient.getSession();
      if (session.success && session.data) {
        this.username = session.data.username;
        // 如果有头像路径，使用它；否则使用默认头像
        this.userAvatar = session.data.avatar || '../../assets/atrior.png';
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  } // 触发文件选择
  triggerFileSelect() {
    this.$refs.fileInput.click();
  }

  // 处理文件选择
  async handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (files && files.length > 0) {
      const file = files[0];

      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        ElMessage.error('请选择图片文件');
        return;
      }

      // 验证文件大小（例如限制5MB）
      if (file.size > 5 * 1024 * 1024) {
        ElMessage.error('图片大小不能超过5MB');
        return;
      }

      await this.uploadAvatar(file);
    }
  }

  // 上传头像
  async uploadAvatar(file: File) {
    this.uploading = true;

    try {
      // 使用二进制上传方式
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': file.type, // 直接设置为图片的MIME类型
        },
        body: file, // 直接发送文件对象
        credentials: 'include', // 包含session
      });

      const result = await response.json();

      if (result.success) {
        ElMessage.success('头像上传成功！');
        this.userAvatar = result.avatar; // 更新头像显示
        // 重新加载用户信息以确保数据同步
        await this.loadUserInfo();
        console.log('Upload success:', result);
      } else {
        ElMessage.error(result.message || '上传失败');
        console.error('Upload failed:', result);
      }
    } catch (error) {
      console.error('Upload error:', error);
      ElMessage.error('上传失败，请重试');
    } finally {
      this.uploading = false;
      this.$refs.fileInput.value = '';
    }
  }
}
</script>

<template>
  <div class="container">
    <client-only>
      <div class="profile-bg">
        <img src="../../../../public/profile_bg/gbc.png" alt="" />
      </div>
    </client-only>
    <div class="profile-info">
      <div class="profile-details">
        <div class="profile-name">
          <!-- 隐藏的文件输入 -->
          <input ref="fileInput" type="file" accept="image/*" @change="handleFileChange" style="display: none" />

          <!-- 头像显示和上传区域 -->
          <client-only>
            <div class="profile-avatar" @click="triggerFileSelect" :class="{ uploading: uploading }">
              <img :src="userAvatar" alt="用户头像" />
              <div class="profile-avatar-upload">
                <el-icon v-if="!uploading" size="50" color="#fff"><Upload /></el-icon>
                <div v-else class="loading-spinner">上传中...</div>
              </div>
            </div>
          </client-only>

          <h1>Hello, {{ username || 'atrior' }} !</h1>
        </div>
        <div class="profile-items">
          <el-card class="profile-options">
            <template #header>
              <h1 style="font-size: var(--font-medium-size); text-align: center">Personal Information</h1>
            </template>
          </el-card>
          <el-card class="profile-orders">
            <template #header>
              <h1 style="font-size: var(--font-medium-size); text-align: center">Shopping Tools</h1>
            </template>
            <!-- <div class="profile-orders-buttons">
              <client-only>
                <el-button round class="pro-btn">Cart</el-button>
                <el-button round class="pro-btn">Orders</el-button>
                <el-button round class="pro-btn">Edit Profile</el-button>
              </client-only>
            </div> -->
          </el-card>
        </div>
      </div>
    </div>
    <my-footer />
  </div>
</template>

<style scoped lang="less">
.container {
  width: 100%;
  height: auto;
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;

  & .profile-bg {
    width: 100%;
    height: 400px;
    position: relative;
    top: 0;
    overflow: hidden;

    & img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      position: absolute;
      top: 0;
    }
  }

  & .profile-info {
    width: 100%;
    height: calc(100% - 500px);
    background-color: #f5f5f5;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    & .profile-details {
      width: 50%;
      height: 100%;
      // background-color: red;
      position: relative;

      & .profile-name {
        width: 100%;
        height: 90px;
        // background-color: green;
        position: relative;
        display: flex;
        align-items: start;

        & h1 {
          font-size: 35px;
          font-weight: 100;
          margin-top: 10px;
          margin-left: 50px;
        }

        & .profile-avatar {
          height: 100px;
          aspect-ratio: 1;
          border: 5px solid #fff;
          border-radius: 50%;
          overflow: hidden;
          position: relative;
          transform: translateY(-50%);
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;

          &.uploading {
            pointer-events: none;

            .profile-avatar-upload {
              opacity: 1;
              background-color: rgba(0, 0, 0, 0.6);
            }
          }

          &:hover {
            .profile-avatar-upload {
              opacity: 1;
            }
          }

          &-upload {
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.4);
            position: absolute;
            top: 0;
            left: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2;
            transition: opacity 0.3s ease;
            opacity: 0;

            .loading-spinner {
              color: #fff;
              font-size: 14px;
              font-weight: 500;
            }
          }

          & img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            position: absolute;
            top: 0;
          }
        }
      }

      & .profile-items {
        width: 100%;
        height: 500px;
        // background-color: green;
        margin-bottom: 100px;
        display: flex;
        gap: 20px;
        justify-content: center;
        align-items: start;
        & .profile-card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        & .profile-options {
          width: 60%;
          height: 90%;
        }

        & .profile-orders {
          width: 30%;
          height: 50%;
          display: flex;
          flex-direction: column;
          // justify-content: space-around;
          align-items: center;
        }
      }
    }
  }
}

.profile-orders-buttons {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 10px;
}

.pro-btn {
  width: 80%;
  height: 30px;
  display: flex;
}
</style>
