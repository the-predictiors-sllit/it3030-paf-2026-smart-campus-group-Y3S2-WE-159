## Minio

to check a stored image can use this `http://localhost:9000/incident-reports/broken_glass_123.jpg`
`http://localhost:9000/[BUCKET_NAME]/[FILE_NAME]`

use the image name like this for db `Timestamp + ID + Original Name`


## to create UUID for primary keys

CREATE TABLE Notifications (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Message NVARCHAR(255)
);

@Id
@GeneratedValue(strategy = GenerationType.AUTO) // Or leave it for DB default
@Column(name = "Id", updatable = false, nullable = false)
private String id;



or using java


@Id
@GeneratedValue
@Column(name = "Id", updatable = false, nullable = false)
private java.util.UUID id;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @Builder.Default
    private java.util.UUID id = java.util.UUID.randomUUID();
    
    private String message;
}