# Grader
Grading tool for teachers (Metropolia Software Structures &amp; Models)

https://graderapp.herokuapp.com/

### Uses Spring boot for REST API
Uses [Grader](https://github.com/ollivilmi/Grader/blob/master/src/main/java/controller/Grader.java), session object to manage grade distribution.

Grader uses [Exam](https://github.com/ollivilmi/Grader/blob/master/src/main/java/controller/component/Exam.java), which contains:
- [Students](https://github.com/ollivilmi/Grader/blob/master/src/main/java/controller/component/Student.java)
- [Grade](https://github.com/ollivilmi/Grader/blob/master/src/main/java/controller/component/Grade.java) settings
- Thresholds

#### Exam uses a preset to generate thresholds based on the configurations.
- Equal distribution (thresholds distributed by the same interval)
- Easy exam (increasing function)
- Medium exam (randomizes results for 0->max points and uses normal distribution)
- Hard exam (decreasing function)

### Grader analyzes results by using the Apache Math library.
[Statistics](https://github.com/ollivilmi/Grader/blob/master/src/main/java/controller/model/Statistic.java)
- Mean
- Median
- Deviation
- Min
- Max

Suggests redistribution with a function that is based on Normal Distribution and probability of results.
