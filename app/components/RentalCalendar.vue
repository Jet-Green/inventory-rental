<script setup lang="ts">
import type { IAvailabilityRange } from "~/types/rental";

defineProps<{
  ranges: IAvailabilityRange[];
}>();
</script>

<template>
  <v-card flat class="pa-4">
    <h3 class="mb-3">Календарь доступности</h3>
    <v-table density="compact">
      <thead>
        <tr>
          <th>Период</th>
          <th>Статус</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="range in ranges" :key="`${range.from}-${range.to}`">
          <td>{{ range.from }} - {{ range.to }}</td>
          <td>
            <v-chip :color="range.isBooked ? 'red' : 'green'" size="small" label>
              {{ range.isBooked ? "Занято" : "Свободно" }}
            </v-chip>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>
