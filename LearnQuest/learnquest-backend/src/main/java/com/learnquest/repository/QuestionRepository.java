package com.learnquest.repository;

import com.learnquest.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    @Query(value = "SELECT * FROM questions WHERE topic = :topic AND difficulty = :difficulty ORDER BY RAND() LIMIT 10", nativeQuery = true)
    List<Question> findRandomQuestions(@Param("topic") String topic, @Param("difficulty") String difficulty);
}