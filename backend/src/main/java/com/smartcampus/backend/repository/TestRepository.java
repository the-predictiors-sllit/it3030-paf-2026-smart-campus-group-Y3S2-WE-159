package com.smartcampus.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcampus.backend.model.TestEntity;

public interface TestRepository extends JpaRepository<TestEntity,Long>{
}
