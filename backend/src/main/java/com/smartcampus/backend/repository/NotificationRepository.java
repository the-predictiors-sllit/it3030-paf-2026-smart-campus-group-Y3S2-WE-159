package com.smartcampus.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.smartcampus.backend.model.Notification;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, String> {

    List<Notification> findByUserId(String userId); // Get notifications by for a user

    List<Notification> findByUserIdAndReadFalse(String userId); // unread notifications

    List<Notification> findByUserIdAndReadTrue(String userId);// read notification

    List<Notification> findByUserIdAndType(String userId, String type); // notifications by type

    // Mark one notification as read
    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.id = :id")
    void markAsRead(@Param("id") String id);

    // Mark all notification as read
    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.userId = :userId")
    void markAllAsRead(@Param("userId") String userId);

}
