<script setup lang="ts">
import { ref, shallowRef, onMounted } from 'vue';
import Chart from 'primevue/chart';
import Button from 'primevue/button';
import { ChartData } from 'chart.js';
import OverlayPanel from 'primevue/overlaypanel';

const props = defineProps(['x_dataset', 'y1_dataset', 'y2_dataset', 'type'])

interface point {
    x: number,
    y: number
}
const x_coordinate = ref()
const y_coordinate = ref()
const student_points = ref<point[]>([])
const chartOptions = shallowRef();
const chartData = shallowRef<ChartData>();


const setChartData = () => {
    return {
        labels: props.x_dataset,
        datasets: [
            {

                type: 'line',
                label: 'Dataset 1',
                fill: false,
                borderColor: '#9c27b0',
                yAxisID: 'y',
                tension: 0,
                pointRadius: 0,
                data: props.y1_dataset
            },
            {
                type: 'line',
                label: 'Dataset 2',
                fill: false,
                borderColor: '#9c27b0',
                yAxisID: 'y',
                tension: 0,
                pointRadius: 0,
                data: props.y2_dataset
            },
            {
                type: 'line',
                label: 'Dataset 3',
                fill: false,
                borderColor: '#4caf50',
                yAxisID: 'y',
                tension: 0,
                data: []
            }
        ]
    };
};
const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);

    return {
        stacked: false,
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
            legend: {
                display: false
            }
        },
        color: documentStyle.getPropertyValue('--font-color'),
        animation: false,
        scales: {
            x: {
                type: 'linear',
                ticks: {
                    color: documentStyle.getPropertyValue('--font-color'),
                },
                grid: {
                    color: documentStyle.getPropertyValue('--empty-gauge-color'),
                }
            },
            y: {
                type: props.type,
                display: true,
                position: 'left',
                ticks: {
                    color: documentStyle.getPropertyValue('--font-color'),
                },
                grid: {
                    color: documentStyle.getPropertyValue('--empty-gauge-color'),
                }
            },


        }
    };
}

function add_point() {
    student_points.value.push({ x: x_coordinate.value, y: y_coordinate.value })

    let o1 = chartData.value
    if (!o1)
        return;
    o1.datasets[2].data.push({ x: x_coordinate.value, y: y_coordinate.value })
    const o2 = {
        labels: o1.labels,
        datasets: o1.datasets
    }
    chartData.value = o2
    x_coordinate.value = null
    y_coordinate.value = null
}

function remove_point(index: number) {
    student_points.value.splice(index, 1)
    let o1 = chartData.value
    if (!o1)
        return;
    o1.datasets[2].data.splice(index, 1)
    const o2 = {
        labels: o1.labels,
        datasets: o1.datasets
    }
    chartData.value = o2
}

const overlay_panel_pt = {
    root: { style: 'max-height: 280px; overflow-y: scroll;' },
    content: { style: 'padding: 8px 8px 0px 8px;' },
};
const add_point_overlay_ref = ref()
function show_chart_cursor_info_op_overlay_panel(_event: MouseEvent) {
    add_point_overlay_ref.value.toggle(_event);
}

onMounted(() => {
    chartOptions.value = setChartOptions();
    chartData.value = setChartData() as ChartData
})

</script>

<template>
    <div id="re850_chart_container">
        <Button icon="pi pi-cog" id="add_point_overlay_button" rounded outlined text @click="show_chart_cursor_info_op_overlay_panel" />

        <OverlayPanel ref="add_point_overlay_ref" :pt="overlay_panel_pt" style="font-family: Cairo, sans-serif;">
            <div id="student_points_container">
                <div id="data_wrapper ">
                    <div id="data_preview_table_header" class="points_container">
                        <div class="point_wrapper ">
                            <p class="point_text"> X </p>
                            <p class="point_text"> Y </p>
                        </div>
                        <p class="point_text"> - </p>
                    </div>
                    <div style="height: 4px;"></div>

                    <div class="points_container" v-for="(point, i) in student_points">
                        <div class="point_wrapper">
                            <p class="point_text"> {{ point.x }}</p>
                            <p class="point_text"> {{ point.y }}</p>
                        </div>
                        <div style="width: 24px;"></div>
                        <Button style="color: #DD2C00;" class="small_btn" icon="pi pi-times" outlined rounded text @click="remove_point(i)" />
                    </div>
                </div>

                <div style="margin-top: 16px; margin-bottom: 8px;" class="points_container">
                    <div class="point_wrapper">
                        <input class="dt_tf" v-model="x_coordinate" @keyup.enter="add_point()" />
                        <input class="dt_tf" v-model="y_coordinate" @keyup.enter="add_point()" />
                    </div>
                    <div style="width: 24px;"></div>
                    <Button class="small_btn" outlined rounded text icon="pi pi-plus" @click="add_point()" />
                </div>
            </div>
        </OverlayPanel>


        <Chart id="lt_re850_chart" :data="chartData" :options="chartOptions" />
    </div>
</template>

<style scoped>
.small_btn {
    width: 26px;
    height: 26px;
}

.point_text {
    width: 60px;
    text-align: center;
    color: var(--font-color);
    font-weight: bold;
    font-size: 14px;
    margin: 0px;
}

#data_preview_table_header {
    border-bottom: 2px solid var(--font-color);
}


#add_point_overlay_button {
    position: absolute;
    right: 8px;
    z-index: 1;
    width: 32px;
    height: 32px;
    color: var(--accent-color);
}

#data_wrapper {
    height: fit-content;
    width: 200px;
    margin-bottom: 12px;
    position: relative;
}

.dt_tf {
    font-family: "Lucida Console", "Courier New", monospace;
    width: 60px;
    color: var(--font-color);
    border: none;
    background-color: var(--dark-bg-color);
    font-size: 12px;
    font-weight: bold;
    padding: 4px;
}

.dt_tf:focus {
    outline: none;
    border: 1px solid var(--accent-color);
}

.point_wrapper {
    display: flex;
    gap: 4px;
}

.points_container {
    display: flex;
    align-items: center;
}

#student_points_container {
    display: flex;
    flex-direction: column;
    max-height: 100px;
}

#re850_chart_container {
    position: relative;
}

#lt_re850_chart {
    height: 35vh;
    width: calc(100% - 16px);
    margin: 8px;
    border-radius: 4px;
    background-color: var(--dark-bg-color);
    border: 1px solid var(--empty-gauge-color);
}
</style>