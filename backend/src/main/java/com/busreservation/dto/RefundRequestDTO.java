package com.busreservation.dto;

import lombok.Data;

@Data
public class RefundRequestDTO {
    private Long bookingId;
    private String reason;
}
