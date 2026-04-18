package com.smartcampus.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.smartcampus.backend.dto.UserDTO;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public User syncUser(String auth0Id, String name, String email, String role) {
        return userRepository.findById(auth0Id).map(existingUser -> {
            boolean changed = false;

            if (!name.equals(existingUser.getName())) {
                existingUser.setName(name);
                changed = true;
            }
            if (!email.equals(existingUser.getEmail())) {
                existingUser.setEmail(email);
                changed = true;
            }
            if (existingUser.getRole() != role) {
                existingUser.setRole(role);
                changed = true;
            }

            return changed ? userRepository.save(existingUser) : existingUser;
        }).orElseGet(() -> {
            User newUser = new User();
            newUser.setId(auth0Id);
            newUser.setName(name);
            newUser.setEmail(email);
            newUser.setRole(role);
            return userRepository.save(newUser);
        });
    }

    public User getUser(String auth0Id) {
        return userRepository.findById(auth0Id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }


    //get one user by email
    public Optional<UserDTO> getUserByEmail(String email){
        Optional<User> user = userRepository.findByEmail(email);
        return user.map(this::convertToDTO);
    }

    // get one user by id
    public Optional<UserDTO> getUserById(String id){
        Optional<User> user = userRepository.findById(id);
        return user.map(this::convertToDTO);
    }

    // get all users
    public List<UserDTO> getAllUsers(){
        List<User> users = userRepository.findAll();
        return users.stream()
        .map(this::convertToDTO)
        .toList();
    }


    private UserDTO convertToDTO(User user){
        return UserDTO.builder()
            .id(user.getId())
            .email(user.getEmail())
            .name(user.getName())
            .role(user.getRole())
            .createdAt(user.getCreatedAt())
            .build();
    }

}
