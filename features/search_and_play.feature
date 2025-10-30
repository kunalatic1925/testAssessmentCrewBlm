Feature: Search, play, pause, seek, screenshot, and title check on a video site

  Background:
    Given I open the video site

  Scenario: Search and interact with a video
    When I search for a keyword
    Then I should see at least one search result
    When I open the first video result
    Then the video should start playing
    When I pause the video
    Then the video should be paused
    When I seek forward in the video
    Then the video time should have advanced
    When I take a screenshot while playing
    Then the screenshot file should exist
    And the video title should not be empty
