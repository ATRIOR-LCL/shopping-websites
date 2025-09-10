<script lang="ts">
import { ItemDTO } from '@common/modules/items/item.dto';
import { Vue, Options } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { ElCard, ElButton, ElIcon } from 'element-plus';
import { Close } from '@element-plus/icons-vue';

@Options({
  components: { ElCard, ElButton, ElIcon, Close },
})
export default class CartContainer extends Vue {
  @Prop() visible!: boolean;
  @Prop() items!: Array<ItemDTO>;
  mounted() {
    console.log('CartContainer mounted', this.visible);
    console.log('CartContainer mounted', this.items);
  }
  get getItemsLength() {
    return this.items.length;
  }

  get getItems() {
    return this.items;
  }
}
</script>

<template>
  <div class="cart-container" v-if="visible">
    <h2 style="text-align: center; color: #000;">Shopping Cart</h2>

    <el-button
      style="
        position: fixed;
        top: 70px;
        right: 70px;
        width: 32px;
        height: 32px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
      "
      type="danger"
      circle
      @click="$emit('close-cart')"
    >
      <el-icon style="font-size: 18px">
        <Close />
      </el-icon>
    </el-button>

    <el-card class="cart-content" style="overflow-y: auto !important;">
      <div v-if="getItemsLength === 0" style="text-align: center; margin-top: 50px">Your cart is empty.</div>
      <div v-else style="padding: 20px; max-height: 80%; overflow-y: auto">
        <div
          v-for="(item, index) in getItems"
          :key="index"
          class="cart-item"
          style="margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center;"
        >
          <div style="flex: 1; margin-right: 15px;">
            <h3>{{ item.itemName }} {{ item.itemEmoji }}</h3>
            <p>{{ item.description }}</p>
            <p>Price: ${{ item.price }}</p>
          </div>
          <el-button
            type="danger"
            size="small"
            @click="$emit('remove-item', index)"
            style="flex-shrink: 0;"
          >
            Remove
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style>
.cart-container {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(15px);
  z-index: 1001;

  & .cart-content {
    width: 40%;
    height: 70%;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.cart-item {
  padding: 0 10px;
  background-color: rgba(255, 255, 255, 1);
  transition: background-color 0.3s ease;
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
}
</style>
