-- +migrate Up
GRANT USAGE ON *.* TO 'dp_user'@'%' IDENTIFIED BY PASSWORD '*F80CFEB6FB4E234D88846BC30385B3483337FF45';
GRANT SELECT, INSERT, UPDATE, DELETE ON `dp`.* TO 'dp_user'@'%';