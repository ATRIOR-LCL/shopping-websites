<script lang="ts">
import { Vue, Options } from 'vue-class-component';
import { View, RenderMethod, RenderMethodKind } from 'bwcx-client-vue3';
import MyFooter from '@client/components/my-footer.vue';
import MyItem from '@client/components/item.vue';

@View('/')
@Options({
  components: {
    MyFooter,
    MyItem
  },
})
@RenderMethod(RenderMethodKind.SSR)
export default class HomeView extends Vue {

  mounted() {
    console.log('HomeView mounted');
  }
}
</script>

<template>
  <div class="home-view">
    <!-- <my-item/> -->
     <div class="items-container">
        <my-item v-for="n in 6" :key="n"/>
     </div>
    <my-footer/>
  </div>
</template>


<style scoped lang="less">
.home-view {
  width: 100%;
  height: auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  gap: 20px;

  & .items-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    width: 90%;
    // background-color: green;
    margin-bottom: 60px;
    margin-top: 100px;
  }
}
</style>
