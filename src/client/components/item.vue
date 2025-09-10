<script lang="ts">
import { Vue, Options } from 'vue-class-component';
import { ElCard, ElButton } from 'element-plus';

@Options({
  components: {
    ElCard,
    ElButton
  },
})
export default class MyItem extends Vue {}
</script>

<template>
    <el-card class="el-card" shadow="hover" style="width: 300px; height: 400px; margin: 20px;">
      <div class="card-image">
        
      </div>
      <div class="card-footer">
        <h3>Item Title</h3>
        <p>Item description goes here. This is a brief overview of the item.</p>
        <p>Price: $99.99</p>
        <el-button type="primary">Buy Now</el-button>
      </div>
    </el-card>
</template>

<style scoped lang="less">
.el-card {
  width: 300px;
  height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  & .card-image {
    width: 100%;
    height: 60%;
    background-color: #f0f0f0;
    font-size: var(--font-large-size);
  }
  & .card-footer {
    width: 100%;
    height: 40%;
    text-align: center;
    & h3 {
      margin: 10px 0 5px 0;
    }
    & p {
      margin: 5px 0;
    }
    & .el-button {
      margin-top: 10px;
    }
  }
}
</style>
