package com.smartcampus.backend.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartcampus.backend.dto.NotificationDTO;
import com.smartcampus.backend.model.Notification;
import com.smartcampus.backend.repository.NotificationRepository;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository; // connecting the repository

    // get all notifications for a user
    public List<NotificationDTO> getAllNotifications(String userId) {
        List<Notification> notifications = notificationRepository.findByUserId(userId);
        return notifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // get unread notifications
    public List<NotificationDTO> getUnreadNotifications(String userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndReadFalse(userId);
        return notifications.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    //get read notifications
    public List<NotificationDTO> getReadNotifications(String userId){
        List<Notification> notifications = notificationRepository.findByUserIdAndReadTrue(userId);
        return notifications.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // get one notification by id
    public Optional<NotificationDTO> getNotificationById(String notificationId){
        Optional<Notification> notification = notificationRepository.findById(notificationId);
        return notification.map(this::convertToDTO);
    }

    public Optional<NotificationDTO> getNotificationByIdForUser(String notificationId, String userId) {
        return notificationRepository.findByIdAndUserId(notificationId, userId).map(this::convertToDTO);
    }

    //Create New notification
    public NotificationDTO createNotification(Notification notification){
        if(notification.getId()==null){
            notification.setId("notif_" + UUID.randomUUID().toString().substring(0, 8));
        }
        Notification saved = notificationRepository.save(notification);
        return convertToDTO(saved);
    }

    // mark one notification as read
    @Transactional
    public void markNotificationAsRead(String notificationId){
        notificationRepository.markAsRead(notificationId);
    }

    @Transactional
    public boolean markNotificationAsReadForUser(String notificationId, String userId) {
        Optional<Notification> notification = notificationRepository.findByIdAndUserId(notificationId, userId);
        if (notification.isEmpty()) {
            return false;
        }

        Notification current = notification.get();
        if (!Boolean.TRUE.equals(current.getRead())) {
            current.setRead(true);
            notificationRepository.save(current);
        }
        return true;
    }

    // Mark all notification as read
    @Transactional
    public void markAllNotificationsAsRead(String userId){
        notificationRepository.markAllAsRead(userId);
    }

    private NotificationDTO convertToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .referenceId(notification.getReferenceId())
                .read(notification.getRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
