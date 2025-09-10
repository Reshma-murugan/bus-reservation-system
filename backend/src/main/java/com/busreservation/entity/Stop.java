package com.busreservation.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "stops")
public class Stop {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(unique = true)
    private String name;

    @NotBlank
    private String cityCode;

    public Stop() {}

    public Stop(Long id, String name, String cityCode) {
        this.id = id;
        this.name = name;
        this.cityCode = cityCode;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCityCode() { return cityCode; }
    public void setCityCode(String cityCode) { this.cityCode = cityCode; }

    // Builder pattern
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id;
        private String name;
        private String cityCode;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder cityCode(String cityCode) { this.cityCode = cityCode; return this; }
        public Stop build() {
            return new Stop(id, name, cityCode);
        }
    }
}