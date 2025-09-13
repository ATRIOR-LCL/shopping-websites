<script lang="ts">
import { Vue, Options } from 'vue-class-component';
import { View } from 'bwcx-client-vue3';
import { ElTimeline, ElCard, ElTimelineItem } from 'element-plus';
import { AsyncDataOptions } from '@client/typings';
import { GetOrdersResDTO } from '@common/modules/orders/oders.dto';
import { RenderMethod } from 'bwcx-client-vue3';
import { RenderMethodKind } from 'bwcx-client-vue3';
import { Prop } from 'vue-property-decorator';

@View('/orders')
@Options({
  components: {
    ElTimeline,
    ElCard,
    ElTimelineItem,
  },
})
@RenderMethod(RenderMethodKind.SSR)
export default class OrdersView extends Vue {
  @Prop() ordersState!: GetOrdersResDTO;

  async mounted() {
    console.log('OrdersView mounted');
  }

  async asyncData({ apiClient }: AsyncDataOptions) {
    try {
      const res = await apiClient.getOrders();
      return {
        ordersState: res,
      };
    } catch (error) {}
  }
}
</script>

<template>
  <div class="orders-view">
    <h2 v-if="!ordersState.rows.length">You have no orders</h2>
    <el-timeline v-else style="width: 80%; margin-top: 20px">
      <el-timeline-item
        v-for="item in ordersState.rows"
        :key="item.orderDate"
        :timestamp="item.orderDate"
        placement="top"
      >
        <el-card v-for="value in item.orders" :key="value.orderId" style="margin-bottom: 10px">
          <h3>Order #{{ value.orderId }}</h3>
          <p>Details about order #{{ value.orderId }}...</p>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<style scoped lang="less">
.orders-view {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  display: flex;
}
</style>
