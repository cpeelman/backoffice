import { Component, OnInit } from '@angular/core';
import { JhiAlertService } from 'ng-jhipster';
import { HttpErrorResponse } from '@angular/common/http';
import { AgeDistributionService } from 'app/graphs/general/age-distribution/age-distribution.service';

@Component({
    selector: 'jhi-general-age-distribution',
    templateUrl: './age-distribution.component.html',
    styles: []
})
export class AgeDistributionComponent implements OnInit {
    today = new Date();
    interval = 10;

    ageDistributionLabels: string[] = [];
    ageDistributionData: any[] = [{ data: [], label: 'Number of people' }];
    ageDistributionChartType = 'bar';
    ageDistributionLegend = true;
    ageDistributionOptions: any = { scaleShowVerticalLines: false, responsive: true };

    constructor(protected ageDistributionService: AgeDistributionService, protected jhiAlertService: JhiAlertService) {}

    loadAll() {
        const lastYear = this.today.getFullYear() - 1;
        this.ageDistributionService.query(new Date(lastYear, 1, 1), this.today).subscribe(
            result => {
                const keys = Object.keys(result).sort();
                const data = [];

                keys.forEach(key => {
                    const min = +key;
                    const max = min + this.interval;
                    this.ageDistributionLabels.push(`${min} - ${max}`);

                    data.push(result[key]);
                });
                this.ageDistributionData = [{ data: data, label: 'Number of people' }];
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    ngOnInit() {
        this.loadAll();
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}