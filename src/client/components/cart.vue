<script lang="ts">
import { Vue, Options } from 'vue-class-component';
import { ElBadge, ElIcon } from 'element-plus';
import { ShoppingTrolley } from '@element-plus/icons-vue';
import { ClientOnly } from 'vite-ssr';
import { Prop } from 'vue-property-decorator';

@Options({
  components: {
    ElBadge,
    ElIcon,
    ShoppingTrolley,
    ClientOnly,
  },
})
export default class Cart extends Vue {
  @Prop({
    type: Number,
    default: 0,
  })
  itemCount!: number;
}
</script>

<template>
  <div class="cart">
    <client-only>
      <el-badge :value="itemCount" class="item">
        <el-icon><ShoppingTrolley style="width: 36px; height: 36px" /></el-icon>
      </el-badge>
    </client-only>
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
  left: 80px;
  z-index: 1000;
  cursor: pointer;

  & .item {
    width: 50%;
    height: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
