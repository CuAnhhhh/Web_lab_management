CREATE TABLE Schedulers (
        SchedulerId varchar(36),
        CreatedBy varchar(36),
        EventType int,
        StartDate datetime,
        EndDate datetime,
		Description varchar(1000),
		ProjectId varchar(36)
);