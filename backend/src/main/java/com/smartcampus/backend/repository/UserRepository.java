package com.smartcampus.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartcampus.backend.model.User;


@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email); //get notifications by email.

    Optional<User> findById(String id);
}
