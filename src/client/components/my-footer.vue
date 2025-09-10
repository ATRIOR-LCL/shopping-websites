<script lang="ts">
import { Vue } from 'vue-class-component';

export default class MyFooter extends Vue {}
</script>

<template>
  <footer class="my-footer">
    Develop by 计科2303吴锦皓 <img src="../assets/atrior.png" class="atrior" alt="" /> 2025-09-10.
  </footer>
</template>

<style scoped lang="less">
.my-footer {
  width: 100%;
  height: 50px;
  background-color: #eaeaea;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: 0;
  font-size: var(--font-small-size);
  & .atrior {
    margin: 5px;
    width: calc(var(--font-small-size) + 10px);
    display: block;
  }
}
</style>
