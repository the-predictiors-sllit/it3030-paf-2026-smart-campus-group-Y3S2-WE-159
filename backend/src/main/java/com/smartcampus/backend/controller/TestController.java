package com.smartcampus.backend.controller;

import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.backend.model.TestEntity;
import com.smartcampus.backend.repository.TestRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("api/test")
public class TestController {
    @Autowired
    private TestRepository repository;

    @GetMapping("/dg-check")
    public String checkDb() {
        try {
            TestEntity t = new TestEntity();
            t.setTestName("Connection Successful");
            repository.save(t);
            return "Database connection is working! Saved ID: " + t.getId();
        } catch (Exception e) {
            return "Database connection failed: " + e.getMessage();
        }
    }

}
