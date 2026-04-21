@RestController
@RequestMapping("/api/analytics")
@PreAuthorize("hasRole('ADMIN')") // Security Requirement
public class AnalyticsController {

    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping("/bookings/summary")
    public ResponseEntity<Map<String, Object>> getBookingSummary() {
        Map<String, Object> data = new HashMap<>();
        data.put("resources", bookingRepository.findMostBookedResources());
        data.put("statusDistribution", bookingRepository.findStatusDistribution());
        data.put("trends", bookingRepository.findBookingTrendsLast7Days());
        data.put("peakHours", bookingRepository.findPeakHours());
        return ResponseEntity.ok(data);
    }
}