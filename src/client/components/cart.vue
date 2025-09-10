<script lang="ts">
import { Vue, Options } from 'vue-class-component';
import { ElBadge, ElIcon } from 'element-plus';
import { ShoppingTrolley } from '@element-plus/icons-vue';

@Options({
  components: {
    ElBadge,
    ElIcon,
    ShoppingTrolley
  },
})
export default class Cart extends Vue {}
</script>

<template>
  <div class="cart">
    <el-badge :value="3" class="item">
      <el-icon><ShoppingTrolley /></el-icon>
    </el-badge>
  </div>
</template>

<style scoped lang="less">
.cart {
  position: fixed;
  width: 50px;
  height: 50px;
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  bottom: 80px;
  left: 0px;
  z-index: 1000;
}
</style>
