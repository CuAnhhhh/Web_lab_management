CREATE TABLE Messages (
    MessageId varchar(36),
    SendId varchar(36),
    ReceiveId varchar(36),
    ProjectId varchar(36),
	Message varchar(1000),
	MessageType bit,
	TimeStamp datetime
);