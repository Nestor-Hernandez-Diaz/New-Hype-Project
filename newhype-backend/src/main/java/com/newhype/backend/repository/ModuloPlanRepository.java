package com.newhype.backend.repository;

import com.newhype.backend.entity.ModuloPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ModuloPlanRepository extends JpaRepository<ModuloPlan, Long> {

    List<ModuloPlan> findByPlanId(Long planId);

    void deleteByPlanId(Long planId);
}
