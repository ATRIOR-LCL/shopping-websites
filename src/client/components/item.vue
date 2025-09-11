<script lang="ts">
import { Vue, Options } from 'vue-class-component';
import { ElCard, ElButton, ElSlider } from 'element-plus';
import { ClientOnly } from 'vite-ssr';
import { Prop } from 'vue-property-decorator';

@Options({
  components: {
    ElCard,
    ElButton,
    ElSlider,
    ClientOnly,
  },
})
export default class MyItem extends Vue {
  @Prop() itemId!: number;
  @Prop() itemEmoji!: string;
  @Prop() itemName!: string;
  @Prop() description!: string;
  @Prop() price!: number;

  state = {
    quantity: 0,
  };

  handleChange(value: number) {
    this.state.quantity = value;
  }

  addToCart() {
    if (this.state.quantity > 0) {
      const itemsToAdd = [];
      for (let i = 0; i < this.state.quantity; i++) {
        itemsToAdd.push({
          itemId: this.itemId,
          itemEmoji: this.itemEmoji,
          itemName: this.itemName,
          description: this.description,
          price: this.price
        });
      }

      // 向父组件发射事件，传递数量和商品信息
      this.$emit('add-to-cart', {
        quantity: this.state.quantity,
        items: itemsToAdd
      });

      this.state.quantity = 0;

      console.log(`Added ${this.state.quantity} items (${this.itemName}) to cart`);
    }
  }
}
</script>

<template>
  <el-card class="my-card" shadow="hover" style="width: 300px; height: 400px; margin: 20px">
    <template #header>
      <div class="card-image">{{ itemEmoji }}</div>
    </template>
    <div class="card-desc">
      <h3>{{ itemName }}</h3>
      <p>{{ description }}</p>
      <p>Price: ${{ price }}</p>
    </div>
    <template #footer>
      <div class="card-footer">
        <client-only>
          <el-slider show-input v-model="this.state.quantity" size="small" :max="5" @input="handleChange" />
          <el-button type="primary" :disabled="state.quantity === 0" @click="addToCart">Add to Cart</el-button>
        </client-only>
      </div>
    </template>
  </el-card>
</template>

<style scoped lang="less">
.my-card {
  width: 300px;
  height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  position: relative;

  &:hover {
    .card-image {
      transform: scale(1.1);
    }
  }
  & .card-image {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 220px;
    height: 100px;
    font-size: 60px;
    transform: scale(1);
    transition: transform 0.3s ease;
    text-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
    user-select: none;
  }

  & .card-desc {
    width: 100%;
    text-align: center;
    & h3 {
      margin: 10px 0 5px 0;
    }
    & p {
      margin: 5px 0;
    }
  }

  & .card-footer {
    width: 220px;
    text-align: center;
    & .el-button {
      margin-top: 10px;
    }
  }
}
</style>
