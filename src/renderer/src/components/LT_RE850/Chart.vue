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
onMounted(() => {

    chartOptions.value = setChartOptions();
    chartData.value = setChartData() as ChartData
})
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
                    display: false
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
    content: { style: 'padding: 8px;' },
};

const add_point_overlay_ref = ref()


function show_chart_cursor_info_op_overlay_panel(_event: MouseEvent) {
    add_point_overlay_ref.value.toggle(_event);
}

</script>

<template>
    <div class="re850_chart_container">
        <Button icon="pi pi-plus" class="add_point_overlay_button" title="Add Point" @click="show_chart_cursor_info_op_overlay_panel"  text/>


        <OverlayPanel ref="add_point_overlay_ref" :pt="overlay_panel_pt" style="font-family: Cairo, sans-serif;" :dismissable="false">
            <div class="student_points_container">
                <div class="data_wrapper ">
                    <div class="points_container data_preview_table_header">
                        <div class="point_wrapper ">
                            <p> X </p>
                            <p> Y </p>
                        </div>
                        <p> - </p>

                    </div>

                    <div class="points_container" v-for="(point, i) in student_points">

                        <div class="point_wrapper">
                            <p> {{ point.x }}</p>
                            <p> {{ point.y }}</p>
                        </div>

                        <Button title="Delete" class="pi pi-times" style="border: none; font-size: 12px;color: #DD2C00;" @click="remove_point(i)"  text :pt="{label:{style:'display:none'}}"/>
                    </div>
                </div>





                <div class="points_container">
                    <div class="point_wrapper">
                        <input class="input" v-model="x_coordinate" />
                        <input class="input" v-model="y_coordinate" />
                    </div>

                    <Button style="padding: 0;margin: 0;width:100%;text-align: end;" icon="pi pi-plus"  @click="add_point" text/>
                </div>

            </div>

        </OverlayPanel>


        <Chart class="lt_re850_chart" :data="chartData" :options="chartOptions"  />
    </div>
</template>

<style scoped>
.points_container>*:last-child{
    width: 100%;
    padding-inline: 8px;
    text-align: end;

}
p{
    width: 60px;
    text-align: center;
    color: var(--font-color);
    font-weight: bold;
    font-size: 14px;
}
.add_point {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;

}
button{
    padding: 0;
    margin: 0;
    border: none;
}

.data_preview_table_header {
    position: sticky;
    top: 0px;
    border-bottom: 2px solid var(--font-color);
    background-color: #1f2937;
    z-index: 2;
}


.add_point_overlay_button {
    position: absolute;
    border-radius: 100%;
    position: absolute;
    z-index: 1;
    width: 32px;
    height: 32px;
    color: var(--accent-color);
    background-color: transparent;
    border: none;
    right: 8px;
    top: 8px;
}

p {
    margin: 0;
    padding: 0;
}
.data_wrapper{
    height: 120px;
    width: 200px;
    margin-bottom: 12px;
    overflow-y: scroll;
    position: relative;
}
input {
    font-family: "Lucida Console", "Courier New", monospace;
    color: var(--font-color);
    border: none;
    background-color: var(--dark-bg-color);
    font-size: 12px;
    font-weight: bold;
    padding: 4px;
    width: 60px;
}

.point_part {
    display: flex;
    gap: 4px;
    justify-content: center;
    align-items: center;
}

.point_wrapper {
    display: flex;
    gap: 4px;
}

.points_container {
    display: flex;
    gap: 8px;
    align-items: center;
}

.student_points_container {
    display: flex;
    flex-direction: column;

}

.re850_chart_container {
    position: relative;
}

.lt_re850_chart {
    height: 35vh;
    width: calc(100% - 16px);
    margin: 8px;
    border-radius: 4px;
    background-color: var(--dark-bg-color);
    border: 1px solid var(--empty-gauge-color);
}
</style>