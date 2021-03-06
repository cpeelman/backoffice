import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { IHomePage } from 'app/shared/model/home-page.model';
import { AccountService } from 'app/core';
import { HomePageService } from './home-page.service';

@Component({
    selector: 'jhi-home-page',
    templateUrl: './home-page.component.html'
})
export class HomePageComponent implements OnInit, OnDestroy {
    homePages: IHomePage[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        protected homePageService: HomePageService,
        protected jhiAlertService: JhiAlertService,
        protected eventManager: JhiEventManager,
        protected accountService: AccountService
    ) {}

    loadAll() {
        this.homePageService
            .query()
            .pipe(
                filter((res: HttpResponse<IHomePage[]>) => res.ok),
                map((res: HttpResponse<IHomePage[]>) => res.body)
            )
            .subscribe(
                (res: IHomePage[]) => {
                    this.homePages = res;
                },
                (res: HttpErrorResponse) => this.onError(res.message)
            );
    }

    ngOnInit() {
        this.loadAll();
        this.accountService.identity().then(account => {
            this.currentAccount = account;
        });
        this.registerChangeInHomePages();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: IHomePage) {
        return item.id;
    }

    registerChangeInHomePages() {
        this.eventSubscriber = this.eventManager.subscribe('homePageListModification', response => this.loadAll());
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
