package com.smartcampus.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class Auth0SyncScheduler {

    private static final Logger log = LoggerFactory.getLogger(Auth0SyncScheduler.class);

    private final Auth0UserSyncService syncService;

    @Value("${app.auth0-sync.enabled:true}")
    private boolean enabled;

    public Auth0SyncScheduler(Auth0UserSyncService syncService) {
        this.syncService = syncService;
    }

    @Scheduled(cron = "${app.auth0-sync.cron:0 0/30 * * * *}")
    public void runSync() {
        if (!enabled) {
            return;
        }

        int synced = syncService.syncAllUsers();
        log.info("Auth0 sync completed. Synced {} users", synced);
    }
}

