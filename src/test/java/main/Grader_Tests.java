package main;

import java.util.Map;
import java.util.Random;
import org.junit.Test;
import org.classes.Exam;
import org.classes.Grade;
import org.classes.Grader;
import static org.junit.Assert.*;

public class Grader_Tests {
    @Test public void testPoints() {
        Grader grader = testObject();
        for (Map.Entry<Double, Double> t : grader.getExam().getThresholds().entrySet())
        {
            double previousValue = t.getValue();
            grader.setByPoints(t.getKey(), previousValue+1);
            assertTrue(previousValue < t.getValue());
            grader.setByPoints(t.getKey(), previousValue);
            assertTrue(previousValue == t.getValue());
        }   
    }
    
    @Test public void addStudents() {
        Grader grader = testObject();
        Random random = new Random();
        for (int i = 0; i<100; i++)
        {
            grader.addStudent(i, "student");
            grader.addResult(i, 30 * random.nextDouble());
        }
        assertNotNull(grader.getExamResults());
    }
    
    private Grader testObject()
    {
        Grade grade = new Grade(1,5,0.5);
        Exam exam = new Exam(10,30,grade,1);
        return new Grader(grade, exam);
    }
}
