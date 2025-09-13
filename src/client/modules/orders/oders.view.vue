<script lang="ts">
import { Vue, Options } from 'vue-class-component';
import { View } from 'bwcx-client-vue3';
import { ElTimeline, ElCard, ElTimelineItem } from 'element-plus';
import { AsyncDataOptions } from '@client/typings';
import { GetOrdersResDTO } from '@common/modules/orders/oders.dto';
import { RenderMethod } from 'bwcx-client-vue3';
import { RenderMethodKind } from 'bwcx-client-vue3';
import { Prop } from 'vue-property-decorator';
import dayjs from 'dayjs';

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


  formatDateTime(dateString: string): string {
    if (!dateString) return '';
    return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss');
  }
}
</script>

<template>
  <div class="orders-view">
    <h2 v-if="!ordersState.rows.length">You have no orders</h2>
    <el-timeline v-else style="width: 50%; margin-top: 20px">
      <el-timeline-item
        v-for="item in ordersState.rows"
        :key="item.orderDate"
        :timestamp="item.orderDate"
        placement="top"
      >
        <el-card class="order-date-card" style="margin-bottom: 10px; width: 100% !important; height: auto">
          <el-card
            v-for="value in item.orders"
            :key="value.orderId"
            style="width: 300px; height: 200px; text-align: center; user-select: none;"
            class="order-card"
          >
            <template #header>
              <h1 style="font-size: 40px; text-shadow: 0 0 15px rgba(0, 0, 0, 0.3);" class="order-item-emoji">{{ value.item.itemEmoji }}</h1>
            </template>
            <p style="font-size: var(--font-medium-size); display: flex; justify-content: center; align-items: center;width: 100%;">{{ value.item.itemName }}</p>
            <template #footer>
              <p style="font-size: var(--font-medium-size);">{{ formatDateTime(value.orderTime) }}</p>
            </template>
          </el-card>
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
  padding-top: 100px;
}

.order-date-card :deep(.el-card__body) {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: start;
  padding: 20px;
}

.order-date-card {
  background: none;
  border: none;
  box-shadow: none;
}

.order-item-emoji {
  transform: scale(1);
  transition: transform 0.3s ease;
}

.order-card:hover {
  & .order-item-emoji {
    transform: scale(1.1);
  }
}
</style>
