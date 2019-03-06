import { Component, OnInit } from '@angular/core';
import { JhiAlertService } from 'ng-jhipster';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { IDevice } from 'app/shared/model/device.model';
import { filter, map } from 'rxjs/operators';
import { ActivityService } from 'app/graphs/activity/activity.service';
import { DeviceService } from 'app/entities/device';

@Component({
    selector: 'jhi-activity',
    templateUrl: './activity.component.html',
    styleUrls: ['../graphs.scss']
})
export class ActivityComponent implements OnInit {
    devicesLoading = false;
    graphLoading = false;

    deviceOptions: IDevice[] = [];
    timeIntervalOptions = [15, 30, 60, 120];
    chartTypeOptions = [{ type: 'bar', name: 'Bar Chart' }, { type: 'line', name: 'Line chart' }];

    selectedDevice: IDevice;
    timeInterval = 15;
    selectedChartType = this.chartTypeOptions[0];

    activitiesLabels: string[] = [];
    activitiesData: any[] = [{ data: [], label: 'F' }, { data: [], label: 'M' }];
    activitiesChartType = this.selectedChartType.type;
    activitiesLegend = true;
    activitiesOptions: any = { scaleShowVerticalLines: false, responsive: true };

    constructor(
        protected activityService: ActivityService,
        protected deviceService: DeviceService,
        protected jhiAlertService: JhiAlertService
    ) {}

    loadAll() {
        this.devicesLoading = true;
        this.deviceService
            .query()
            .pipe(
                filter((res: HttpResponse<IDevice[]>) => res.ok),
                map((res: HttpResponse<IDevice[]>) => res.body)
            )
            .subscribe(
                (res: IDevice[]) => {
                    const allDevices = { id: -1, name: 'All', postalCode: 0, homepage: null };
                    this.deviceOptions.push(allDevices);
                    res.forEach(device => this.deviceOptions.push(device));

                    if (this.deviceOptions.length > 0) {
                        this.selectStore(this.deviceOptions[0]);
                    }
                    this.devicesLoading = false;
                },
                (res: HttpErrorResponse) => {
                    this.onError(res.message);
                    this.devicesLoading = false;
                }
            );
    }

    updateTable() {
        this.graphLoading = true;
        this.activitiesLabels = [];
        const numberOfStores = this.selectedDevice.id === -1 ? this.deviceOptions.length - 1 : 1;
        this.activityService.query(this.selectedDevice.id, this.timeInterval).subscribe(
            result => {
                const keys = Object.keys(result).sort();

                const maleData = [];
                const femaleData = [];

                keys.forEach((key, index) => {
                    if (this.timeInterval <= 15) {
                        this.activitiesLabels.push(key);
                    } else {
                        if (index < keys.length - 1) {
                            this.activitiesLabels.push(key.toString() + ' - ' + keys[index + 1]);
                        } else {
                            this.activitiesLabels.push(key.toString() + ' - 19:00');
                        }
                    }

                    maleData.push(Math.round(result[key]['m'] / numberOfStores));
                    femaleData.push(Math.round(result[key]['f'] / numberOfStores));
                });

                this.activitiesData = [{ data: femaleData, label: 'F' }, { data: maleData, label: 'M' }];
                this.graphLoading = false;
            },
            (res: HttpErrorResponse) => {
                this.onError(res.message);
                this.graphLoading = false;
            }
        );
    }

    ngOnInit() {
        this.loadAll();
    }

    selectStore(device: IDevice) {
        this.selectedDevice = device;
        this.updateTable();
    }

    selectChartType(chartType) {
        this.selectedChartType = chartType;
        this.activitiesChartType = this.selectedChartType.type;
        this.updateTable();
    }

    selectTimeInterval(interval: number) {
        this.timeInterval = interval;
        this.updateTable();
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
