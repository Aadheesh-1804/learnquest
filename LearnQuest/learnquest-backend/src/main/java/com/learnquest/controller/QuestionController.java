package com.learnquest.controller;

import com.learnquest.dto.AnswerCheckRequest;
import com.learnquest.dto.AnswerCheckResponse;
import com.learnquest.dto.QuestionResponse;
import com.learnquest.model.Question;
import com.learnquest.repository.QuestionRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "*")
public class QuestionController {

    private final QuestionRepository questionRepository;

    public QuestionController(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    @GetMapping
    public List<QuestionResponse> getQuizQuestions(
            @RequestParam String topic,
            @RequestParam String difficulty) {
        List<Question> questions = questionRepository.findRandomQuestions(topic, difficulty.toUpperCase());
        return questions.stream()
                .map(QuestionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @PostMapping("/check")
    public AnswerCheckResponse checkAnswer(@RequestBody AnswerCheckRequest request) {
        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new NoSuchElementException("Question not found"));

        boolean isCorrect = question.getCorrectOption().equalsIgnoreCase(request.getSelectedOption());
        return new AnswerCheckResponse(isCorrect, question.getCorrectOption());
    }
}