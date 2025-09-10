<script lang="ts">
import { Vue } from 'vue-class-component';
export default class Head extends Vue {

}
</script>

<template>
  <header class="app-header">
    <h1>Shopping Websites</h1>
  </header>
</template>

<style scoped lang="less">
.app-header {
  position: fixed;
  top: 0;
  width: 100vw;
  height: 70px;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
</style>
